pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '982287259474'
        AWS_REGION = 'us-west-1'
        FRONTEND_REPO = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-frontend'
        BACKEND_REPO = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-backend'
        TEST_INSTANCE = 'ubuntu@13.52.211.131'
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
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                }
            }
        }

        stage('Build and Push Docker Images on Test Instance') {
            steps {
                script {
                    echo '🔨 Building and pushing Docker images...'
                    sh """
                    ssh -o StrictHostKeyChecking=no ${TEST_INSTANCE} '
                    cd /home/ubuntu/skillnaav-test &&
                    docker-compose down &&
                    docker-compose build &&
                    docker tag skillnaav-fullstack-frontend:latest ${FRONTEND_REPO}:latest &&
                    docker tag skillnaav-fullstack-backend:latest ${BACKEND_REPO}:latest &&
                    docker push ${FRONTEND_REPO}:latest &&
                    docker push ${BACKEND_REPO}:latest
                    '
                    """
                }
            }
        }

        stage('Deploy Updated Containers on Test Instance') {
            steps {
                script {
                    echo '🚢 Deploying updated containers...'
                    sh """
                    ssh -o StrictHostKeyChecking=no ${TEST_INSTANCE} '
                    docker-compose down &&
                    docker pull ${FRONTEND_REPO}:latest &&
                    docker pull ${BACKEND_REPO}:latest &&
                    docker-compose up -d
                    '
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
            echo '❌ Deployment failed! Check logs for errors.'
        }
    }
}
