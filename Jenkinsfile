pipeline {
    agent any

    environment {
        ECR_REPOSITORY_BACKEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-backend'
        ECR_REPOSITORY_FRONTEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-frontend'
        AWS_REGION = 'us-west-1'
        DOCKER_IMAGE_TAG = "${GIT_COMMIT}"
        TEST_INSTANCE_IP = '13.52.211.131'
    }

    stages {
        stage('Clone Code') {
            steps {
                script {
                    git branch: 'uday18-02-25', url: 'https://github.com/saipraneethEdutechex/skillnaav-fullstack.git'
                }
            }
        }

        stage('Authenticate with AWS ECR') {
            steps {
                script {
                    sshagent(credentials: ['test-instance-ssh-key']) {
                        sh '''
                        echo "🔐 Authenticating Docker with AWS ECR..."
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP <<'EOF'
                            aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 982287259474.dkr.ecr.$AWS_REGION.amazonaws.com
                        EOF
                        '''
                    }
                }
            }
        }

        stage('Clean Docker Environment') {
            steps {
                script {
                    sshagent(credentials: ['test-instance-ssh-key']) {
                        sh '''
                        echo "🧹 Cleaning Docker Environment..."
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP <<'EOF'
                            set -e
                            docker stop $(docker ps -aq) || true
                            docker system prune -af --volumes || true
                        EOF
                        '''
                    }
                }
            }
        }

        stage('Copy Source Code to Test Instance') {
            steps {
                script {
                    sshagent(credentials: ['test-instance-ssh-key']) {
                        sh '''
                        echo "📂 Copying Source Code to Test Instance..."
                        rsync -avz --exclude='.git' ./ ubuntu@$TEST_INSTANCE_IP:/home/ubuntu/skillnaav-fullstack
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images on Test Instance') {
            steps {
                script {
                    sshagent(credentials: ['test-instance-ssh-key']) {
                        sh '''
                        echo "🐳 Building Docker Images..."
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP <<'EOF'
                            set -e
                            cd /home/ubuntu/skillnaav-fullstack
                            
                            docker build -t $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG ./backend
                            docker build -t $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG ./frontend
                        EOF
                        '''
                    }
                }
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                script {
                    sshagent(credentials: ['test-instance-ssh-key']) {
                        sh '''
                        echo "🚀 Pushing Docker Images to AWS ECR..."
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP <<'EOF'
                            set -e
                            docker push $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG
                            docker push $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG
                        EOF
                        '''
                    }
                }
            }
        }

        stage('Deploy to Test Instance') {
            steps {
                script {
                    sshagent(credentials: ['test-instance-ssh-key']) {
                        sh '''
                        echo "🚢 Deploying to Test Instance..."
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP <<'EOF'
                            set -e
                            cd /home/ubuntu/skillnaav-fullstack

                            # Update Docker Compose with new image tags
                            sed -i "s|image:.*$ECR_REPOSITORY_BACKEND:.*|image: $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG|" docker-compose.yml
                            sed -i "s|image:.*$ECR_REPOSITORY_FRONTEND:.*|image: $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG|" docker-compose.yml

                            echo "🛑 Stopping current Docker containers..."
                            docker-compose down || true

                            echo "📥 Pulling updated Docker images..."
                            docker-compose pull

                            echo "🚀 Starting new Docker containers..."
                            docker-compose up -d

                            echo "🔍 Checking running containers:" 
                            docker ps -a
                        EOF
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment to Test Instance completed successfully!'
        }
        failure {
            echo '❌ Deployment failed! Check the logs for errors.'
        }
    }
}
