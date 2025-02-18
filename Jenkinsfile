pipeline {
    agent any

    environment {
        ECR_REPOSITORY_BACKEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-backend'
        ECR_REPOSITORY_FRONTEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-frontend'
        AWS_REGION = 'us-west-1'
        DOCKER_IMAGE_TAG = "${GIT_COMMIT}"
        SSH_CREDENTIALS_ID = 'test-instance-ssh-key' // Jenkins SSH credential ID
        TEST_INSTANCE_IP = '13.52.211.131' // Test instance IP
    }

    stages {
        stage('Clone Code') {
            steps {
                script {
                    git branch: 'uday18-02-25', url: 'https://github.com/saipraneethEdutechex/skillnaav-fullstack.git'
                }
            }
        }

        stage('Prepare Test Instance') {
            steps {
                sshagent(['test-instance-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP << 'EOF'
                            set -e  # Exit on error
                            echo "Updating system and installing dependencies..."
                            sudo apt-get update -y
                            sudo apt-get install -y awscli docker.io docker-compose

                            echo "Starting Docker service..."
                            sudo systemctl enable docker
                            sudo systemctl start docker

                            echo "Authenticating with AWS ECR..."
                            aws ecr get-login-password --region ${AWS_REGION} | sudo docker login --username AWS --password-stdin ${ECR_REPOSITORY_BACKEND}
                            aws ecr get-login-password --region ${AWS_REGION} | sudo docker login --username AWS --password-stdin ${ECR_REPOSITORY_FRONTEND}
                        EOF
                    """
                }
            }
        }

        stage('Build Docker Images on Test Instance') {
            steps {
                sshagent(['test-instance-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP << 'EOF'
                            set -e  # Exit on error
                            echo "Cleaning up old Docker resources..."
                            sudo docker system prune -af --volumes
                            sudo docker volume prune -a -f

                            echo "Cloning latest codebase..."
                            cd /home/ubuntu/skillnaav-fullstack || exit 1
                            git pull origin uday18-02-25

                            echo "Building Docker images..."
                            sudo docker build -t ${ECR_REPOSITORY_BACKEND}:${DOCKER_IMAGE_TAG} ./backend
                            sudo docker build -t ${ECR_REPOSITORY_FRONTEND}:${DOCKER_IMAGE_TAG} ./frontend
                        EOF
                    """
                }
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                sshagent(['test-instance-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP << 'EOF'
                            set -e  # Exit on error
                            echo "Pushing Docker images to AWS ECR..."
                            sudo docker push ${ECR_REPOSITORY_BACKEND}:${DOCKER_IMAGE_TAG}
                            sudo docker push ${ECR_REPOSITORY_FRONTEND}:${DOCKER_IMAGE_TAG}
                        EOF
                    """
                }
            }
        }

        stage('Deploy to Test Instance') {
            steps {
                sshagent(['test-instance-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ubuntu@$TEST_INSTANCE_IP << 'EOF'
                            set -e  # Exit on error
                            echo "Updating docker-compose configuration with new image tags..."

                            cd /home/ubuntu/skillnaav-fullstack || exit 1

                            sed -i "s|image: .*${ECR_REPOSITORY_BACKEND}:.*|image: ${ECR_REPOSITORY_BACKEND}:${DOCKER_IMAGE_TAG}|" docker-compose.yml
                            sed -i "s|image: .*${ECR_REPOSITORY_FRONTEND}:.*|image: ${ECR_REPOSITORY_FRONTEND}:${DOCKER_IMAGE_TAG}|" docker-compose.yml

                            echo "Restarting Docker containers..."
                            sudo docker-compose down
                            sudo docker-compose pull
                            sudo docker-compose up -d

                            echo "Checking running Docker containers..."
                            sudo docker ps -a
                        EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Deployment completed successfully!'
        }
        failure {
            echo '❌ Deployment failed! Check logs for errors.'
        }
    }
}
