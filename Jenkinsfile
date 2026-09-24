pipeline {
    agent any

    environment {
        VERCEL_TOKEN     = credentials('VERCEL_TOKEN')
        TELEGRAM_TOKEN   = credentials('TELEGRAM_TOKEN')
        TELEGRAM_CHAT_ID = credentials('TELEGRAM_CHAT_ID')
        REPO_NAME        = 'supabase-vercel-demo'
        BRANCH_NAME      = 'main'
        DEPLOY_URL       = ''
    }

    stages {
        stage('Notify Start') {
            steps {
                script {
                    def commitHash = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : sh(script: "git rev-parse --short HEAD || echo 'unknown'", returnStdout: true).trim()
                    def message = """🚀 <b>Bắt đầu deploy website</b>
Repository: ${env.REPO_NAME}
Branch: ${env.BRANCH_NAME}
Commit: ${commitHash}"""
                    sendTelegram(message)
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                script {
                    echo "Deploying to Vercel..."
                    // Chạy Node 20 container để build và deploy lên Vercel
                    sh '''
                        docker run --rm \
                          -v "$(pwd)":/app \
                          -w /app \
                          -e VERCEL_TOKEN="${VERCEL_TOKEN}" \
                          node:20-alpine sh -c "
                            npm install -g vercel@latest &&
                            vercel pull --yes --environment=production --token=\\$VERCEL_TOKEN &&
                            vercel build --prod --token=\\$VERCEL_TOKEN &&
                            DEPLOY_OUTPUT=\\$(vercel deploy --prebuilt --prod --token=\\$VERCEL_TOKEN) &&
                            echo \\"WEBSITE_URL=\\${DEPLOY_OUTPUT}\\" > /app/deploy_output.env
                          "
                    '''
                    def deployEnv = readFile('deploy_output.env')
                    env.DEPLOY_URL = deployEnv.split('=')[1].trim()
                    echo "Deployed successfully to: ${env.DEPLOY_URL}"
                }
            }
        }
    }

    post {
        success {
            script {
                def siteUrl = env.DEPLOY_URL ?: "https://supabase-vercel-demo-2.vercel.app"
                def message = """✅ <b>Deploy thành công</b>
Repository: ${env.REPO_NAME}
Branch: ${env.BRANCH_NAME}
Website: ${siteUrl}"""
                sendTelegram(message)
            }
        }
        failure {
            script {
                def commitHash = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : sh(script: "git rev-parse --short HEAD || echo 'unknown'", returnStdout: true).trim()
                def message = """❌ <b>Deploy thất bại</b>
Repository: ${env.REPO_NAME}
Branch: ${env.BRANCH_NAME}
Commit: ${commitHash}
Error: Pipeline build failed. Vui lòng kiểm tra Console Output trên Jenkins."""
                sendTelegram(message)
            }
        }
    }
}

def sendTelegram(String message) {
    writeFile file: 'tg_msg.txt', text: message
    sh '''
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "parse_mode=HTML" \
        --data-urlencode "text@tg_msg.txt" > /dev/null
    '''
}