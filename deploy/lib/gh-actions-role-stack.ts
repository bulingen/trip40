import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubActionsRoleProps extends cdk.StackProps {
    githubOidcProviderArn: string;
    githubRepo: string; // Format: "owner/repo"
    branch?: string; // Default to "main"
}

export class GitHubActionsRoleStack extends cdk.Stack {
    public readonly githubActionsRole: iam.Role;

    constructor(scope: Construct, id: string, props: GitHubActionsRoleProps) {
        super(scope, id, props);

        const branch = props.branch || 'main';

        this.githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
            assumedBy: new iam.FederatedPrincipal(
                props.githubOidcProviderArn,
                {
                    StringEquals: {
                        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
                    },
                    StringLike: {
                        'token.actions.githubusercontent.com:sub': `repo:${props.githubRepo}:ref:refs/heads/${branch}`,
                    },
                },
                'sts:AssumeRoleWithWebIdentity'
            ),
            roleName: `${id}-GitHubActionsRole`,
            description: `Role for GitHub Actions deployments from ${props.githubRepo} on ${branch} branch`,
            maxSessionDuration: cdk.Duration.hours(1),
        });

        this.githubActionsRole.addToPolicy(
            new iam.PolicyStatement({
                sid: 'assumerolecdk',
                effect: iam.Effect.ALLOW,
                actions: [
                    'sts:AssumeRole',
                    'iam:PassRole'
                ],
                resources: [
                    `arn:aws:iam::${this.account}:role/cdk-hnb659fds-lookup-role-${this.account}-${this.region}`,
                    `arn:aws:iam::${this.account}:role/cdk-hnb659fds-deploy-role-${this.account}-${this.region}`,
                    `arn:aws:iam::${this.account}:role/cdk-hnb659fds-file-publishing-role-${this.account}-${this.region}`,
                    `arn:aws:iam::${this.account}:role/cdk-hnb659fds-image-publishing-role-${this.account}-${this.region}`,
                ],
            })
        );

        new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
            value: this.githubActionsRole.roleArn,
            description: 'GitHub Actions Role ARN',
        });

        new cdk.CfnOutput(this, 'GitHubActionsRoleName', {
            value: this.githubActionsRole.roleName,
            description: 'GitHub Actions Role Name',
        });
    }
}
