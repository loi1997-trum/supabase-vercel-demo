pipeline {
    agent any

    environment {
        VERCEL_TOKEN      = credentials('VERCEL_TOKEN')
        TELEGRAM_TOKEN    = credentials('TELEGRAM_TOKEN')
        TELEGRAM_CHAT_ID  = credentials('TELEGRAM_CHAT_ID')
        VERCEL_ORG_ID     = 'team_LIVWO1DlOTPV3tatbatRcNon'
        VERCEL_PROJECT_ID = 'prj_eLH8KAJtkPpbSWuw9A9XyuMeGahg'
        REPO_NAME         = 'supabase-vercel-demo'
        BRANCH_NAME       = 'main'
    }

    stages {
        stage('Notify Start') {
            steps {
                script {
                    env.COMMIT_HASH = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    def msg = "🚀 Bắt đầu deploy website%0ARepository: ${REPO_NAME}%0ABranch: ${BRANCH_NAME}%0ACommit: ${env.COMMIT_HASH}"
                    sh "curl -s -X POST \"https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage\" -d \"chat_id=${TELEGRAM_CHAT_ID}\" -d \"text=${msg}\""
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                script {
                    // Chạy Node container qua Docker để deploy bằng Vercel CLI
                    sh '''
                        docker run --rm \
                          -v "$(pwd)":/app \
                          -w /app \
                          -e VERCEL_TOKEN="${VERCEL_TOKEN}" \
                          -e VERCEL_ORG_ID="${VERCEL_ORG_ID}" \
                          -e VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID}" \
                          node:18-alpine sh -c "
                            npm install -g vercel &&
                            DEPLOY_URL=\\$(vercel deploy --prod --yes --token=\\$VERCEL_TOKEN --scope=\\$VERCEL_ORG_ID) &&
                            echo \\"WEBSITE_URL=\\${DEPLOY_URL}\\" > /app/deploy_output.env
                          "
                    '''
                    def deployEnv = readFile('deploy_output.env')
                    env.WEBSITE_URL = deployEnv.split('=')[1].trim()
                }
            }
        }
    }

    post {
        success {
            script {
                def msg = "✅ Deploy thành công%0ARepository: ${REPO_NAME}%0ABranch: ${BRANCH_NAME}%0AWebsite: ${env.WEBSITE_URL}"
                sh "curl -s -X POST \"https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage\" -d \"chat_id=${TELEGRAM_CHAT_ID}\" -d \"text=${msg}\""
            }
        }
        failure {
            script {
                def msg = "❌ Deploy thất bại%0ARepository: ${REPO_NAME}%0ABranch: ${BRANCH_NAME}%0ACommit: ${env.COMMIT_HASH}%0AError: Pipeline build failed. Vui lòng kiểm tra Console Output."
                sh "curl -s -X POST \"https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage\" -d \"chat_id=${TELEGRAM_CHAT_ID}\" -d \"text=${msg}\""
            }
        }
    }
}