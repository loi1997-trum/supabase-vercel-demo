pipeline {
    agent any

    environment {
        VERCEL_TOKEN = credentials('VERCEL_TOKEN')
        VERCEL_PROJECT_ID = credentials('VERCEL_PROJECT_ID')
        VERCEL_ORG_ID = credentials('VERCEL_ORG_ID')
        TELEGRAM_BOT_TOKEN = credentials('TELEGRAM_BOT_TOKEN')
        TELEGRAM_CHAT_ID = credentials('TELEGRAM_CHAT_ID')
        DEPLOY_URL = ''
    }

    stages {
        stage('Notify Start') {
            steps {
                script {
                    def commitHash = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    def repoUrl = sh(script: "git config --get remote.origin.url || echo ${env.JOB_NAME}", returnStdout: true).trim()
                    def branch = env.BRANCH_NAME ?: 'main'

                    def message = """🚀 *Bắt đầu deploy website*
*Repository:* `${repoUrl}`
*Branch:* `${branch}`
*Commit:* `${commitHash}`"""

                    sendTelegram(message)
                }
            }
        }

        stage('Deploy to Vercel') {
            steps {
                script {
                    echo "Deploying to Vercel..."
                    // Thiết lập project Vercel và tiến hành deploy production
                    sh """
                        vercel pull --yes --environment=production --token=${VERCEL_TOKEN}
                        vercel build --prod --token=${VERCEL_TOKEN}
                    """
                    // Chạy deploy và lấy URL trang web trả về
                    def output = sh(
                        script: "vercel deploy --prebuilt --prod --token=${VERCEL_TOKEN}",
                        returnStdout: true
                    ).trim()

                    // Lưu URL deploy
                    env.DEPLOY_URL = output.split("\n")[-1].trim()
                    echo "Deployed successfully to: ${env.DEPLOY_URL}"
                }
            }
        }
    }

    post {
        success {
            script {
                def repoUrl = sh(script: "git config --get remote.origin.url || echo ${env.JOB_NAME}", returnStdout: true).trim()
                def branch = env.BRANCH_NAME ?: 'main'
                def siteUrl = env.DEPLOY_URL ?: "https://supabase-vercel-demo-2.vercel.app"

                def message = """✅ *Deploy thành công*
*Repository:* `${repoUrl}`
*Branch:* `${branch}`
*Website:* ${siteUrl}"""

                sendTelegram(message)
            }
        }
        failure {
            script {
                def commitHash = sh(script: "git rev-parse --short HEAD || echo unknown", returnStdout: true).trim()
                def repoUrl = sh(script: "git config --get remote.origin.url || echo ${env.JOB_NAME}", returnStdout: true).trim()
                def branch = env.BRANCH_NAME ?: 'main'
                def errorLog = "Build failed at stage: ${env.STAGE_NAME ?: 'Execution error'}"

                def message = """❌ *Deploy thất bại*
*Repository:* `${repoUrl}`
*Branch:* `${branch}`
*Commit:* `${commitHash}`
*Error:* `${errorLog}`"""

                sendTelegram(message)
            }
        }
    }
}

// Hàm gửi tin nhắn Telegram thông qua cURL
def sendTelegram(String message) {
    sh """
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "parse_mode=Markdown" \
        --data-urlencode "text=${message}" > /dev/null
    """
}
