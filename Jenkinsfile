pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '982287259474'
        AWS_REGION = 'us-west-1'
        FRONTEND_REPO = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-frontend'
        BACKEND_REPO = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-backend'
    }

    stages {

        stage('Clone Repository') {
            steps {
                script {
                    echo 'Cloning repository...'
                    checkout scm
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                script {
                    sh 'aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 982287259474.dkr.ecr.us-west-1.amazonaws.com'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo 'Building Docker images...'
                    sh 'docker-compose down'
                    sh 'docker-compose build'
                }
            }
        }

        stage('Tag and Push Docker Images to ECR') {
            steps {
                script {
                    sh "docker tag skillnaav-fullstack-frontend:latest ${FRONTEND_REPO}:latest"
                    sh "docker tag skillnaav-fullstack-backend:latest ${BACKEND_REPO}:latest"

                    sh "docker push ${FRONTEND_REPO}:latest"
                    sh "docker push ${BACKEND_REPO}:latest"
                }
            }
        }

        stage('Deploy Updated Containers on EC2') {
            steps {
                script {
                    echo 'Deploying containers...'
                    sh '''
                    ssh -o StrictHostKeyChecking=no ubuntu@13.52.211.131 "docker-compose down"
                    ssh -o StrictHostKeyChecking=no ubuntu@13.52.211.131 "docker pull ${FRONTEND_REPO}:latest"
                    ssh -o StrictHostKeyChecking=no ubuntu@13.52.211.131 "docker pull ${BACKEND_REPO}:latest"
                    ssh -o StrictHostKeyChecking=no ubuntu@13.52.211.131 "docker-compose up -d"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed!'
        }
        success {
            echo '✅ Deployment successful!'
        }
        failure {
            echo '❌ Deployment failed! Check logs for errors.'
        }
    }
}
