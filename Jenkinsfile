pipeline {
    agent any
    
    environment {
        ECR_REPOSITORY_BACKEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-backend'
        ECR_REPOSITORY_FRONTEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-frontend'
        AWS_REGION = 'us-west-1'
        DOCKER_IMAGE_TAG = "${GIT_COMMIT}"
        SSH_KEY_ID = 'test-instance-ssh-key'  // Jenkins SSH key to access the test instance
        TEST_INSTANCE_IP = '13.52.211.131'  // IP of your test instance
    }

    stages {
        stage('Clone Code') {
            steps {
                script {
                    git branch: 'uday18-02-25', url: 'https://github.com/saipraneethEdutechex/skillnaav-fullstack.git'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Backend Docker Build
                    sh 'docker build -t $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG ./backend'
                    // Frontend Docker Build
                    sh 'docker build -t $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG ./frontend'
                }
            }
        }

        stage('Authenticate to ECR') {
            steps {
                script {
                    // AWS CLI Authentication to ECR
                    withAWS(credentials: 'aws-credentials') {
                        sh "aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_BACKEND"
                        sh "aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_FRONTEND"
                    }
                }
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                script {
                    // Push backend Docker image to ECR
                    sh "docker push $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG"
                    // Push frontend Docker image to ECR
                    sh "docker push $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG"
                }
            }
        }

        stage('Deploy to Test Instance') {
            steps {
                script {
                    // SSH into the test instance and pull the latest images from ECR
                    sh """
                        ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/${SSH_KEY_ID} ubuntu@$TEST_INSTANCE_IP <<EOF
                            docker-compose -f /home/ubuntu/skillnaav-fullstack/docker-compose.yml down
                            docker-compose -f /home/ubuntu/skillnaav-fullstack/docker-compose.yml pull
                            docker-compose -f /home/ubuntu/skillnaav-fullstack/docker-compose.yml up -d
                        EOF
                    """
                }
            }
        }
    }
}