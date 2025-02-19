pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '982287259474'
        AWS_REGION = 'us-west-1'
        FRONTEND_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/skillnaav-frontend"
        BACKEND_REPO = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/skillnaav-backend"
        EC2_USER = 'ubuntu'
        EC2_HOST = '13.52.211.131'
        SSH_KEY = '~/.ssh/id_rsa'  // Ensure this key is added on Jenkins
    }

    stages {

        stage('Clone Repository') {
            steps {
                script {
                    echo '🚀 Cloning repository...'
                    checkout scm
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                script {
                    echo '🔐 Logging in to AWS ECR...'
                    sh """
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo '🔨 Building Docker images...'
                    sh """
                    docker-compose build
                    """
                }
            }
        }

        stage('Tag and Push Docker Images to ECR') {
            steps {
                script {
                    echo '📦 Tagging and pushing Docker images...'

                    sh """
                    docker tag skillnaav-fullstack-frontend:latest ${FRONTEND_REPO}:latest
                    docker tag skillnaav-fullstack-backend:latest ${BACKEND_REPO}:latest

                    docker push ${FRONTEND_REPO}:latest
                    docker push ${BACKEND_REPO}:latest

                    # Clean up old Docker images
                    docker image prune -f
                    """
                }
            }
        }

        stage('Deploy Updated Containers on EC2') {
            steps {
                script {
                    echo '🚢 Deploying updated containers to EC2...'
                    sh """
                    ssh -o StrictHostKeyChecking=no -i ${SSH_KEY} ${EC2_USER}@${EC2_HOST} << EOF
                        echo '🔄 Pulling updated Docker images...'
                        docker pull ${FRONTEND_REPO}:latest
                        docker pull ${BACKEND_REPO}:latest

                        echo '🛑 Stopping current containers...'
                        cd /home/ubuntu/skillnaav
                        docker-compose down

                        echo '🚀 Starting updated containers...'
                        docker-compose up -d

                        echo '✅ Deployment complete!'
                    EOF
                    """
                }
            }
        }
    }

    post {
        always {
            echo '📊 Pipeline execution completed.'
        }
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed! Check logs for details.'
        }
    }
}
