import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

const DOMAIN_NAME = 'bulingen.com';
const SITE_SUBDOMAIN = 'trip40';

export interface StaticSiteProps extends cdk.StackProps {
  distFolder: string;
}

export class StaticSite extends cdk.Stack {
  public readonly cloudFrontDistribution: cloudfront.Distribution;
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id, props);

    const siteDomain = `${SITE_SUBDOMAIN}.${DOMAIN_NAME}`;

    const zone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: DOMAIN_NAME,
    });

    this.bucket = new s3.Bucket(this, 'StaticSiteBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      description: `OAC for ${id} static site`,
    });

    const certificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      hostedZone: zone,
      region: 'us-east-1',
    });

    this.cloudFrontDistribution = new cloudfront.Distribution(this, 'StaticSiteDistribution', {
      certificate,
      domainNames: [siteDomain],
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket, {
          originAccessControl,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    new route53.ARecord(this, 'SiteAliasRecord', {
      zone,
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.cloudFrontDistribution)),
    });

    new s3deploy.BucketDeployment(this, 'StaticSiteDeployment', {
      sources: [s3deploy.Source.asset(props.distFolder)],
      destinationBucket: this.bucket,
      distribution: this.cloudFrontDistribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'SiteUrl', {
      value: `https://${siteDomain}`,
      description: 'App URL',
    });
    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: this.cloudFrontDistribution.domainName,
      description: 'CloudFront Distribution Domain Name',
    });
    new cdk.CfnOutput(this, 'S3BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 Bucket Name',
    });
  }
}
