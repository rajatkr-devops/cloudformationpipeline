import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { pipeline } from 'stream';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

   // This creates a new CodeCommit repository called 'WorkshopRepo'
   const repo = new codecommit.Repository(this, 'WorkshopRepo', {
    repositoryName: "Infrarepo"
});

// The basic pipeline declaration. This sets the initial structure
// of our pipeline
const pipeline = new codepipeline.Pipeline(this,'Pipeline',{
    pipelineName: "InfraPipeline"
  });    

  const sourceOutput = new codepipeline.Artifact();
  const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
    actionName: "Source",
    repository: repo,
    output: sourceOutput
  });

  const buildProject = new codebuild.PipelineProject(this,"BuildProject",{
    buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
    environment: {
      buildImage: codebuild.LinuxBuildImage.STANDARD_5_0
    }
  });

  const buildArtifact = new codepipeline.Artifact();

  const buildAction = new codepipeline_actions.CodeBuildAction({
    actionName: "build",
    input: sourceOutput,
    project: buildProject,
    outputs: [buildArtifact]
  });

  pipeline.addStage({
    stageName: "Source",
    actions: [sourceAction]
  });

  pipeline.addStage({
    stageName: "build",
    actions: [buildAction]
  });
}
}
