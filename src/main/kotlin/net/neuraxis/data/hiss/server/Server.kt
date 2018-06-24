package net.neuraxis.data.hiss.server

import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import io.ktor.application.*
import io.ktor.content.default
import io.ktor.content.files
import io.ktor.content.static
import io.ktor.features.*
import io.ktor.http.HttpStatusCode
import io.ktor.jackson.*
import io.ktor.request.receive
import io.ktor.response.*
import io.ktor.routing.*
import net.neuraxis.data.hiss.model.*

data class SaveResult(val error: Boolean, val data: Map<String, Any>?, val id: Long?)

@Suppress("Unused")
fun Application.main() {
    install(DefaultHeaders)
    install(CallLogging)
    install(ContentNegotiation) {
        jackson {
            configure(SerializationFeature.INDENT_OUTPUT, true)
            registerModule(JavaTimeModule())
        }
    }

    install(Routing) {
        /**
         * Find
         */
        get("/values") {
            call.respond(Values)
        }
        get("/radiology/rows") {
            call.respond(Radiology.getTotalRowsFor(null))
        }
        get("/radiology/rows/for/{pid}") {
            val pid = call.parameters["pid"]!!.toLong()
            call.respond(Radiology.getTotalRowsFor(pid))
        }
        get("/radiology/records/{limit}/{offset}") {
            val limit = call.parameters["limit"]!!.toLong()
            val offset = call.parameters["offset"]!!.toLong()
            call.respond(Radiology.find(null, limit, offset))
        }
        get("/radiology/records/for/{pid}/{limit}/{offset}") {
            val pid = call.parameters["pid"]!!.toLong()
            val limit = call.parameters["limit"]!!.toLong()
            val offset = call.parameters["offset"]!!.toLong()
            call.respond(Radiology.find(pid, limit, offset))
        }
        get ("/features/for/{ruid}") {
            val ruid= call.parameters["ruid"]!!.toLong()
            call.respond(Radiology.findFeaturesFor(ruid))
        }
        get("/features/{feature}/for/{ruid}") {
            val ruid = call.parameters["ruid"]!!.toLong()
            val feature = call.parameters["feature"]!!.toString()
            when(feature) {
                "stroke" -> call.respond(StrokeFeature.find(ruid))
                "angio" -> call.respond(AngioFeature.find(ruid))
                "degenerative" -> call.respond(DegenerativeFeature.find(ruid))
                "features" -> call.respond(Radiology.findFeaturesFor(ruid))
                else -> call.respond(HttpStatusCode.BadRequest, mapOf("error" to true, "msg" to "`$feature` is not a valid 'feature' path segment"))
            }
        }
        /**
         * Create
         */
        post("/features/{feature}") {
            val feature = call.parameters["feature"]!!.toString()
            val received: Feature = when(feature) {
                "stroke" -> call.receive<StrokeFeature>()
                "angio" -> call.receive<AngioFeature>()
                "degenerative" -> call.receive<DegenerativeFeature>()
                else -> {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to true, "msg" to "`$feature` is not a valid 'feature' path segment"))
                    return@post
                }
            }
            val validation = received.validate()
            if (!validation.isValid) {
                call.respond(SaveResult(true, validation.msg, null))
                return@post
            }

            val id = received.insert()
            call.respond(SaveResult(false, null, id))
        }
        /**
         * Update
         */
        put("/features/{feature}") {
            val feature = call.parameters["feature"]!!.toString()
            val received: Feature = when(feature) {
                "stroke" -> call.receive<StrokeFeature>()
                "angio" -> call.receive<AngioFeature>()
                "degenerative" -> call.receive<DegenerativeFeature>()
                else -> {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to true, "msg" to "`$feature` is not a valid 'feature' path segment"))
                    return@put
                }
            }
            val validation = received.validate()
            if (!validation.isValid) {
                call.respond(SaveResult(true, validation.msg, null))
                return@put
            }
            val id = received.update()
            call.respond(SaveResult(false, null, id))
        }
        /**
         * Delete
         */
        delete("/features/{feature}/{id}") {
            val id = call.parameters["id"]!!.toLong()
            val feature = call.parameters["feature"]!!.toString()
            val deletedId = when (feature) {
                "stroke" -> StrokeFeature.delete(id)
                "angio" -> AngioFeature.delete(id)
                "degenerative" -> DegenerativeFeature.delete(id)
                else -> {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to true, "msg" to "`$feature` is not a valid 'feature' path segment"))
                    return@delete
                }
            }
            call.respond(SaveResult(false, null, deletedId))
        }
        /**
         * Serve static assets
         */
        static("/") {
            files("static")
            default("static/index.html")
        }
    }
}