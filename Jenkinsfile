pipeline {
    agent any

    parameters {
        string(name: 'GIT_REPO', defaultValue: 'https://github.com/saipraneethEdutechex/skillnaav-fullstack.git', description: 'GitHub Repository URL')
        string(name: 'GIT_BRANCH', defaultValue: 'uday18-02-25', description: 'Branch to build')
    }

    environment {
        AWS_REGION = 'us-west-1'
        ECR_REGISTRY = '982287259474.dkr.ecr.us-west-1.amazonaws.com'
        FRONTEND_REPO = "${ECR_REGISTRY}/skillnaav-frontend"
        BACKEND_REPO = "${ECR_REGISTRY}/skillnaav-backend"
        TEST_INSTANCE_IP = '13.52.211.131'
        REMOTE_WORKDIR = '/home/ubuntu/skillnaav-fullstack'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '📦 Pulling latest code from GitHub...'
                    git branch: params.GIT_BRANCH, url: params.GIT_REPO
                }
            }
        }

        stage('Login to AWS ECR') {
            steps {
                script {
                    echo '🔐 Logging in to AWS ECR...'
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    """
                }
            }
        }

        stage('Build and Push Docker Images on Test Instance') {
            steps {
                script {
                    echo '🔨 Building and pushing Docker images...'

                    withCredentials([sshUserPrivateKey(credentialsId: 'skillnaav-test-key', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@${TEST_INSTANCE_IP} '
                            set -e
                            cd ${REMOTE_WORKDIR}

                            echo "🔄 Force syncing with remote branch..."
                            git fetch origin
                            git reset --hard origin/${params.GIT_BRANCH}
                            git clean -fd  # Remove untracked files

                            echo "📉 Stopping existing containers..."
                            docker-compose down || true  # Prevent failure if no containers are running

                            echo "🔧 Building Docker images..."
                            docker-compose build

                            echo "🛳️ Tagging images..."
                            docker tag skillnaav-fullstack_frontend:latest ${FRONTEND_REPO}:latest
                            docker tag skillnaav-fullstack_backend:latest ${BACKEND_REPO}:latest

                            echo "🚀 Pushing images to AWS ECR..."
                            docker push ${FRONTEND_REPO}:latest
                            docker push ${BACKEND_REPO}:latest
                        '
                        """
                    }
                }
            }
        }

        stage('Deploy Updated Containers on Test Instance') {
            steps {
                script {
                    echo '🚢 Deploying updated containers on the test instance...'

                    withCredentials([sshUserPrivateKey(credentialsId: 'skillnaav-test-key', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@${TEST_INSTANCE_IP} '
                            cd ${REMOTE_WORKDIR}

                            echo "🧹 Cleaning up old Docker images and containers..."
                            docker system prune -af --volumes

                            echo "📊 Restarting Docker containers..."
                            docker-compose up -d

                            echo "🔎 Checking container status..."
                            docker ps --format "table {{.Names}}\t{{.Status}}"
                        '
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo '📊 Pipeline execution completed.'
        }
        success {
            echo '✅ Deployment succeeded!'
        }
        failure {
            echo '❌ Deployment failed! Check logs for errors.'
        }
    }
}
