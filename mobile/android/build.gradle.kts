allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    val configureProject = {
        if (project.plugins.hasPlugin("com.android.application") || project.plugins.hasPlugin("com.android.library")) {
            val androidExtension = project.extensions.findByName("android")
            if (androidExtension != null) {
                try {
                    val compileSdkVersionMethod = androidExtension.javaClass.getMethod("compileSdkVersion", Int::class.javaPrimitiveType)
                    compileSdkVersionMethod.invoke(androidExtension, 34)
                } catch (e: Exception) {
                    try {
                        val compileSdkVersionMethod = androidExtension.javaClass.getMethod("compileSdkVersion", String::class.java)
                        compileSdkVersionMethod.invoke(androidExtension, "android-34")
                    } catch (ex: Exception) {}
                }
                try {
                    val buildToolsVersionMethod = androidExtension.javaClass.getMethod("buildToolsVersion", String::class.java)
                    buildToolsVersionMethod.invoke(androidExtension, "34.0.0")
                } catch (e: Exception) {}
            }
        }
    }

    if (project.state.executed) {
        configureProject()
    } else {
        project.afterEvaluate {
            configureProject()
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
