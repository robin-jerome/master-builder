
##  Create Stack - Only to be performed if stack is not created yet

```
aws cloudformation create-stack \
  --stack-name cognito-serverless-api \
  --template-body file://template.yaml \
  --region us-east-1 \
  --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM \
  --profile aws-sandbox
  ```

## Update existing stack

```
aws cloudformation update-stack \
  --stack-name cognito-serverless-api \
  --template-body file://template.yaml \
  --region us-east-1 \
  --capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM \
  --profile aws-sandbox
```

## Delete an existing stack

```
aws cloudformation delete-stack --stack-name cognito-serverless-api --profile aws-sandbox
```

## Deploying the UI

After the stack creation/updating is complete, execute the npm command to upload Web UI artifacts to S3

```
npm run aws-deploy <stack-name> <region> <aws-profile-name>
```

eg:

```
npm run aws-deploy cognito-serverless-api us-east-1 aws-sandbox
```