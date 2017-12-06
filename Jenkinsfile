pipeline {
    agent {
        docker { image 'docker' }
    }
    
    stages {
        stage('Clone, build and push') {
            steps {
                checkout scm
                def app = docker.build("pitasi/informatecibot")
                docker.withRegistry('https://registry.evilcorp.gq:5000', 'docker-registry-login') {
                    app.push("latest")
                }
            }
        }
    }

}