pipeline {
    agent any

    environment {
        ECR_REPOSITORY_BACKEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-backend'
        ECR_REPOSITORY_FRONTEND = '982287259474.dkr.ecr.us-west-1.amazonaws.com/skillnaav-frontend'
        AWS_REGION = 'us-west-1'
        DOCKER_IMAGE_TAG = "${GIT_COMMIT}"
        SSH_KEY_ID = 'test-instance-ssh-key' // Jenkins SSH key to access the test instance
        TEST_INSTANCE_IP = '13.52.211.131' // IP of your test instance
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
                script {
                    sh """
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/${SSH_KEY_ID} ubuntu@$TEST_INSTANCE_IP <<EOF
                        sudo apt-get update -y
                        sudo apt-get install awscli docker.io -y
                        sudo systemctl enable docker
                        sudo systemctl start docker

                        # Authenticate Docker with AWS ECR
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_BACKEND
                        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_FRONTEND
                    EOF
                    """
                }
            }
        }

        stage('Build Docker Images on Test Instance') {
            steps {
                script {
                    sh """
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/${SSH_KEY_ID} ubuntu@$TEST_INSTANCE_IP <<EOF
                        # Cleanup old Docker resources to free space
                        docker system prune -af --volumes

                        # Build Docker images
                        cd /home/ubuntu/skillnaav-fullstack
                        docker build -t $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG ./backend
                        docker build -t $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG ./frontend
                    EOF
                    """
                }
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                script {
                    sh """
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/${SSH_KEY_ID} ubuntu@$TEST_INSTANCE_IP <<EOF
                        docker push $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG
                        docker push $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG
                    EOF
                    """
                }
            }
        }

        stage('Deploy to Test Instance') {
            steps {
                script {
                    sh """
                    ssh -o StrictHostKeyChecking=no -i /var/lib/jenkins/.ssh/${SSH_KEY_ID} ubuntu@$TEST_INSTANCE_IP <<EOF
                        cd /home/ubuntu/skillnaav-fullstack

                        # Update docker-compose.yml with new image tags
                        sed -i 's|image: $ECR_REPOSITORY_BACKEND:.*|image: $ECR_REPOSITORY_BACKEND:$DOCKER_IMAGE_TAG|' docker-compose.yml
                        sed -i 's|image: $ECR_REPOSITORY_FRONTEND:.*|image: $ECR_REPOSITORY_FRONTEND:$DOCKER_IMAGE_TAG|' docker-compose.yml

                        # Restart services with updated images
                        docker-compose down
                        docker-compose pull
                        docker-compose up -d

                        # Ensure Docker containers are running
                        docker ps -a
                    EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully! ✅'
        }
        failure {
            echo 'Deployment failed! ❌ Check logs for errors.'
        }
    }
}
