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
                    def msg = """🚀 *Bắt đầu deploy website*
Repository: `${REPO_NAME}`
Branch: `${BRANCH_NAME}`
Commit: `${env.COMMIT_HASH}`"""
                    sendTelegram(msg)
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                script {
                    sh '''
                        # Cài đặt Vercel CLI bên trong container
                        npm install --global vercel

                        # Deploy trực tiếp lên Production bằng token và project ID
                        DEPLOY_URL=$(vercel deploy --prod --yes \
                            --token=$VERCEL_TOKEN \
                            --scope=$VERCEL_ORG_ID)

                        echo "WEBSITE_URL=${DEPLOY_URL}" > deploy_output.env
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
                def msg = """✅ *Deploy thành công*
Repository: `${REPO_NAME}`
Branch: `${BRANCH_NAME}`
Website: ${env.WEBSITE_URL}"""
                sendTelegram(msg)
            }
        }
        failure {
            script {
                def msg = """❌ *Deploy thất bại*
Repository: `${REPO_NAME}`
Branch: `${BRANCH_NAME}`
Commit: `${env.COMMIT_HASH}`
Error: Pipeline build failed. Vui lòng kiểm tra Console Output trên Jenkins."""
                sendTelegram(msg)
            }
        }
    }
}

def sendTelegram(message) {
    sh """
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${message}" \
            -d "parse_mode=Markdown"
    """
}