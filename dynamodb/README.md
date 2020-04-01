
##  Create Stack - Only to be performed if stack is not created yet

```
aws cloudformation create-stack \
  --stack-name dynamo-stream-lambda \
  --template-body file://template.yaml \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile aws-sandbox
  ```

## Update existing stack

```
aws cloudformation update-stack \
  --stack-name dynamo-stream-lambda \
  --template-body file://template.yaml \
  --region us-east-1 \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile aws-sandbox
```

## Delete an existing stack

```
aws cloudformation delete-stack --stack-name dynamo-stream-lambda --profile <profile-name>
```