pipeline {
    agent any

    environment {
        AWS_REGION = 'us-west-1'
        ECR_REGISTRY = '982287259474.dkr.ecr.us-west-1.amazonaws.com'
        FRONTEND_REPO = "${ECR_REGISTRY}/skillnaav-frontend"
        BACKEND_REPO = "${ECR_REGISTRY}/skillnaav-backend"
        TEST_INSTANCE_IP = '13.52.211.131'
        REMOTE_WORKDIR = '/home/ubuntu/skillnaav-fullstack'
        GIT_BRANCH = 'uday27-02-25'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    echo '📦 Pulling latest code from GitHub...'
                    checkout([$class: 'GitSCM', 
                        branches: [[name: "*/${GIT_BRANCH}"]], 
                        userRemoteConfigs: [[
                            url: 'https://github.com/saipraneethEdutechex/skillnaav-fullstack.git', 
                            credentialsId: 'github-access'
                        ]]
                    ])
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

        stage('Build and Push Docker Images') {
            parallel {
                stage('Build and Push Frontend') {
                    steps {
                        script {
                            echo '🔨 Building and pushing Frontend Docker image...'
                            withCredentials([sshUserPrivateKey(credentialsId: 'skillnaav-test-key', keyFileVariable: 'SSH_KEY')]) {
                                sh """
                                ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@${TEST_INSTANCE_IP} '
                                    set -e
                                    cd ${REMOTE_WORKDIR}
                                    
                                    echo "🔄 Syncing with remote branch..."
                                    git fetch origin
                                    git reset --hard origin/${GIT_BRANCH}

                                    echo "📉 Stopping existing containers..."
                                    docker-compose down || true

                                    echo "🔧 Building Frontend Image..."
                                    docker-compose build frontend

                                    echo "🛳 Tagging Frontend image..."
                                    docker tag skillnaav-fullstack_frontend:latest ${FRONTEND_REPO}:latest
                                    
                                    echo "🔐 Logging in to AWS ECR..."
                                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                                    echo "🚀 Pushing Frontend to AWS ECR..."
                                    docker push ${FRONTEND_REPO}:latest
                                '
                                """
                            }
                        }
                    }
                }
                stage('Build and Push Backend') {
                    steps {
                        script {
                            echo '🔨 Building and pushing Backend Docker image...'
                            withCredentials([sshUserPrivateKey(credentialsId: 'skillnaav-test-key', keyFileVariable: 'SSH_KEY')]) {
                                sh """
                                ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@${TEST_INSTANCE_IP} '
                                    set -e
                                    cd ${REMOTE_WORKDIR}
                                    
                                    echo "🔧 Building Backend Image..."
                                    docker-compose build backend

                                    echo "🛳 Tagging Backend image..."
                                    docker tag skillnaav-fullstack_backend:latest ${BACKEND_REPO}:latest
                                    
                                    echo "🔐 Logging in to AWS ECR..."
                                    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

                                    echo "🚀 Pushing Backend to AWS ECR..."
                                    docker push ${BACKEND_REPO}:latest
                                '
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Deploy Updated Containers') {
            steps {
                script {
                    echo '🚢 Deploying updated containers on the test instance...'
                    withCredentials([sshUserPrivateKey(credentialsId: 'skillnaav-test-key', keyFileVariable: 'SSH_KEY')]) {
                        sh """
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ubuntu@${TEST_INSTANCE_IP} '
                            cd ${REMOTE_WORKDIR}
                            
                            echo "📊 Restarting Docker containers..."
                            docker-compose up --build -d
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
