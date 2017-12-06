pipeline {
    agent {
        docker { image 'docker' }
    }
    
    stages {
        def app

        stage('Clone repository') {
            checkout scm
        }

        stage('Build image') {
            app = docker.build("pitasi/informatecibot")
        }

        stage('Push image') {
            docker.withRegistry('https://registry.evilcorp.gq:5000', 'docker-registry-login') {
                app.push("latest")
            }
        }
    }

}