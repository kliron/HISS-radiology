package net.neuraxis.data.hiss.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import java.sql.*
import io.ktor.locations.*

const val connectionString = "jdbc:sqlite:database.db"

val Kind = listOf(
        "nothing",
        "subarachnoidal hemorrhage",
        "hemorrhage",
        "hemorrhagic transformation",
        "infarct",
        "unspecified",
        "NA"
)

val Temporal = listOf(
        "acute",
        "subacute",
        "chronic",
        "unspecified",
        "NA"
)

val Locations = listOf(
        "MCA territory",
        "ACA territory",
        "PCA territory",
        "frontal",
        "temporal",
        "parietal",
        "insular",
        "occipital",
        "fronto-temporal",
        "fronto-parietal",
        "temporo-parietal",
        "temporo-occipital",
        "parieto-occipital",
        "capsula interna anterior limb",
        "capsula interna posterior limb",
        "corona radiata",
        "thalamus",
        "nucleus caudatus",
        "putamen",
        "globus pallidus",
        "basal ganglia",
        "mesencephalon",
        "pons",
        "medulla oblongata",
        "brainstem unspecified",
        "cerebellum",
        "unspecified",
        "NA"
)

val Side = listOf(
        "left",
        "right",
        "bilateral",
        "unspecified",
        "NA"
)

val Extent = listOf(
        "small",
        "small, multiple",
        "medium",
        "medium, multiple",
        "large",
        "large, multiple",
        "unspecified",
        "unspecified, multiple",
        "NA"
)

val Grade = listOf(
        "none",
        "light",
        "moderate",
        "severe",
        "unspecified",
        "NA"
)

val Vessels = listOf(
        "Aorta",
        "ICA",
        "A1",
        "A2",
        "A3",
        "M1",
        "M2",
        "M3",
        "M4",
        "P1",
        "P2",
        "P3",
        "Vertebral",
        "Basilar",
        "PICA",
        "AICA",
        "SCA",
        "unspecified",
        "NA"
)

val VesselFindings = listOf(
        "nothing",
        "atheromatosis without stenosis",
        "stenosis <= 50%",
        "stenosis < 70%",
        "stenosis >= 70%",
        "stenosis, unspecified grade",
        "caliber variations",
        "occlusion",
        "thrombosis",
        "dense vessel sign",
        "dissection",
        "unspecified",
        "NA"
)

val CorticalAtrophyDescription = listOf(
        "symmetric",
        "right hemisphere predominance",
        "left hemisphere predominance",
        "unspecified",
        "NA"
)

val Values = hashMapOf(
        "Kind" to Kind,
        "Temporal" to Temporal,
        "Locations" to Locations,
        "Side" to Side,
        "Extent" to Extent,
        "Grade" to Grade,
        "Vessels" to Vessels,
        "VesselFinding" to VesselFindings,
        "CorticalAtrophyDescription" to CorticalAtrophyDescription
)

typealias ReportUID = Long
typealias RowId = Long

data class Validation(val isValid: Boolean, val msg: Map<String, String>)

interface Feature {
    val report_uid: ReportUID
    val rowid: RowId
    fun validate(): Validation
    fun insert(): RowId
    fun update(): RowId
}

// Jackson mapper is thread safe and sharing a static object is the recommended way to go according to its author.
object Serializer {
    val mapper = jacksonObjectMapper()
}
// These are not strictly needed as ktor handles serialization/deserialization automatically
interface Json {
    fun fromJson(json: String): Feature = Serializer.mapper.readValue(json)
    fun toJson(): String = Serializer.mapper.writeValueAsString(this)
}

@Location("/radiology")
data class Radiology(val pid: Long,
                     val eid: Long,
                     val order_uid: Long,
                     val examination: String?,
                     val request: String?,
                     val ordered_at: String,
                     val discipline: String,
                     val report_uid: Long,
                     val comment: String,
                     val examination_started_at: String,
                     val report_type: String,
                     val report: String) : Json {

    companion object {
        fun find(pid: Long?, limit: Long, offset: Long): List<Radiology> {
            val sql = if (pid == null) "SELECT * FROM radiology ORDER BY ROWID LIMIT ? OFFSET ?"
                else "SELECT * FROM radiology WHERE pid = ? ORDER BY ROWID LIMIT ? OFFSET ?"

            val results = mutableListOf<Radiology>()
            DriverManager.getConnection(connectionString).use {
                val stmt = it.prepareStatement(sql)
                if (pid != null) {
                    stmt.setLong(1, pid)
                    stmt.setLong(2, limit)
                    stmt.setLong(3, offset)
                } else {
                    stmt.setLong(1, limit)
                    stmt.setLong(2, offset)
                }
                val rs = stmt.executeQuery()
                while (rs.next()) {
                    results.add(Radiology(pid = rs.getLong("pid"),
                                        eid = rs.getLong("eid"),
                                        order_uid = rs.getLong("order_uid"),
                                        examination = rs.getString("examination"),
                                        request = rs.getString("request"),
                                        ordered_at = rs.getString("ordered_at"),
                                        discipline = rs.getString("discipline"),
                                        report_uid = rs.getLong("report_uid"),
                                        comment = rs.getString("comment"),
                                        examination_started_at = rs.getString("examination_started_at"),
                                        report_type = rs.getString("report_type"),
                                        report = rs.getString("report")))
                }
            }
            return results
        }
        fun getTotalRowsFor(pid: Long?): Long {
            val sql = if (pid == null) "SELECT COUNT(*) FROM radiology" else "SELECT COUNT(*) FROM radiology WHERE pid = ?"
            DriverManager.getConnection(connectionString).use {
                val stmt = it.prepareStatement(sql)
                if (pid != null) {
                    stmt.setLong(1, pid)
                }
                val rs = stmt.executeQuery()
                rs.next()
                return rs.getLong(1)
            }
        }
        fun findFeaturesFor(report_uid: ReportUID): HashMap<String, List<Feature>> = hashMapOf(
                "StrokeFeatures" to StrokeFeature.find(report_uid),
                "AngioFeatures" to AngioFeature.find(report_uid),
                "DegenerativeFeatures" to DegenerativeFeature.find(report_uid)
        )
    }
}

@Location("/stroke")
data class StrokeFeature(override val rowid: RowId,
                         override val report_uid: ReportUID,
                         val eid: Long,
                         val pid: Long,
                         val kind: String,
                         val temporal: String,
                         val location: String,
                         val side: String,
                         val extent: String) : Feature, Json {

    companion object {
        fun find(report_uid: ReportUID): List<StrokeFeature> {
            val results = mutableListOf<StrokeFeature>()
            DriverManager.getConnection(connectionString).use {
                val stmt = it.prepareStatement("SELECT ROWID,* FROM stroke_features WHERE report_uid = ?")
                stmt.setLong(1, report_uid)
                val rs = stmt.executeQuery()
                while (rs.next()) {
                    results.add(StrokeFeature(rowid = rs.getLong("rowid"),
                                              report_uid = rs.getLong("report_uid"),
                                              eid = rs.getLong("eid"),
                                              pid = rs.getLong("pid"),
                                              kind = rs.getString("kind"),
                                              temporal = rs.getString("temporal"),
                                              location = rs.getString("location"),
                                              side = rs.getString("side"),
                                              extent = rs.getString("extent")))
                }
            }
            return results
        }
        fun delete(rowid: RowId): RowId {
            DriverManager.getConnection(connectionString).use {
                it.autoCommit = false
                val stmt = it.prepareStatement("DELETE FROM stroke_features WHERE ROWID = ?", Statement.RETURN_GENERATED_KEYS)
                stmt.setLong(1, rowid)
                stmt.executeUpdate()
                it.commit()
                return stmt.generatedKeys.getLong(1)
            }
        }
    }
    override fun validate(): Validation {
        val msg = hashMapOf<String, String>()
        if (!Kind.contains(kind)) {
            msg["kind"] = "$kind is not a valid 'kind' value"
        }
        if (!Temporal.contains(temporal)) {
            msg["temporal"] = "$temporal is not a valid 'temporal' value"
        }
        if (!Locations.contains(location)) {
            msg["location"] = "$location is not a valid 'location' value"
        }
        if (!Side.contains(side)) {
            msg["side"] = "$side is not a valid 'side' value"
        }
        if (!Extent.contains(extent)) {
            msg["extent"] = "$extent is not a valid 'extent' value"
        }

        return Validation(isValid = msg.isEmpty(), msg = msg)
    }
    override fun insert(): RowId {
        DriverManager.getConnection(connectionString).use {
            it.autoCommit = false
            val stmt = it.prepareStatement("INSERT INTO stroke_features (report_uid, eid, pid, kind, temporal, location, side, extent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)
            stmt.setLong(1, report_uid)
            stmt.setLong(2, eid)
            stmt.setLong(3, pid)
            stmt.setString(4, kind)
            stmt.setString(5, temporal)
            stmt.setString(6, location)
            stmt.setString(7, side)
            stmt.setString(8, extent)
            stmt.executeUpdate()
            it.commit()
            return stmt.generatedKeys.getLong(1)
        }
    }
    override fun update(): Long {
        DriverManager.getConnection(connectionString).use {
            it.autoCommit = false
            val stmt = it.prepareStatement("UPDATE stroke_features SET kind = ?, temporal = ?, location = ?, side = ?, extent = ? WHERE ROWID = ?", Statement.RETURN_GENERATED_KEYS)
            stmt.setString(1, kind)
            stmt.setString(2, temporal)
            stmt.setString(3, location)
            stmt.setString(4, side)
            stmt.setString(5, extent)
            stmt.setLong(6, rowid)
            stmt.executeUpdate()
            it.commit()
            return stmt.generatedKeys.getLong(1)
        }
    }
}

@Location("/angio")
data class AngioFeature(override val rowid: RowId,
                        override val report_uid: ReportUID,
                        val eid: Long,
                        val pid: Long,
                        val vessel: String,
                        val side: String,
                        val finding: String) : Feature, Json {

    companion object {
        fun find(report_uid: ReportUID): List<AngioFeature> {
            val results = mutableListOf<AngioFeature>()
            DriverManager.getConnection(connectionString).use {
                val stmt = it.prepareStatement("SELECT ROWID,* FROM angio_features WHERE report_uid = ?")
                stmt.setLong(1, report_uid)
                val rs = stmt.executeQuery()
                while (rs.next()) {
                    results.add(AngioFeature(rowid = rs.getLong("rowid"),
                                             report_uid = rs.getLong("report_uid"),
                                             eid = rs.getLong("eid"),
                                             pid = rs.getLong("pid"),
                                             vessel = rs.getString("vessel"),
                                             side = rs.getString("side"),
                                             finding = rs.getString("finding")))
                }
            }
            return results
        }
        fun delete(rowid: RowId): RowId {
            DriverManager.getConnection(connectionString).use {
                it.autoCommit = false
                val stmt = it.prepareStatement("DELETE FROM angio_features WHERE ROWID = ?", Statement.RETURN_GENERATED_KEYS)
                stmt.setLong(1, rowid)
                stmt.executeUpdate()
                it.commit()
                return stmt.generatedKeys.getLong(1)
            }
        }
    }
    override fun validate(): Validation {
        val msg = hashMapOf<String, String>()
        if (!Vessels.contains(vessel)) {
            msg["vessel"] = "$vessel is not a valid 'vessel' value"
        }
        if (!Side.contains(side)) {
            msg["vessel"] = "$side is not a valid 'side' value"
        }
        if (!VesselFindings.contains(finding)) {
            msg["finding"] = "$finding is not a valid 'finding' value"
        }
        return Validation(isValid = msg.isEmpty(), msg = msg)
    }
    override fun insert(): RowId {
        DriverManager.getConnection(connectionString).use {
            it.autoCommit = false
            val stmt = it.prepareStatement("INSERT INTO angio_features (report_uid, eid, pid, vessel, side, finding) VALUES (?, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)
            stmt.setLong(1, report_uid)
            stmt.setLong(2, eid)
            stmt.setLong(3, pid)
            stmt.setString(4, vessel)
            stmt.setString(5, side)
            stmt.setString(6, finding)
            stmt.executeUpdate()
            it.commit()
            return stmt.generatedKeys.getLong(1)
        }
    }

    override fun update(): RowId {
        DriverManager.getConnection(connectionString).use {
            it.autoCommit = false
            val stmt = it.prepareStatement("UPDATE angio_features SET vessel = ?, side = ?, finding = ? WHERE ROWID = ?", Statement.RETURN_GENERATED_KEYS)
            stmt.setString(1, vessel)
            stmt.setString(2, side)
            stmt.setString(3, finding)
            stmt.setLong(4, rowid)
            stmt.executeUpdate()
            it.commit()
            return stmt.generatedKeys.getLong(1)
        }
    }
}

@Location("/degenerative")
data class DegenerativeFeature(override val rowid: RowId,
                               override val report_uid: ReportUID,
                               val eid: Long,
                               val pid: Long,
                               val cortical_atrophy: String,
                               val cortical_atrophy_description: String,
                               val central_atrophy: String,
                               val microangiopathy: String) : Feature, Json {

    companion object {
        fun find(report_uid: ReportUID): List<DegenerativeFeature> {
            val results = mutableListOf<DegenerativeFeature>()

            DriverManager.getConnection(connectionString).use {
                val stmt = it.prepareStatement("SELECT ROWID,* FROM degenerative_features WHERE report_uid = ?")
                stmt.setLong(1, report_uid)
                val rs = stmt.executeQuery()
                while (rs.next()) {
                    results.add(DegenerativeFeature(rowid = rs.getLong("rowid"),
                                                    report_uid = rs.getLong("report_uid"),
                                                    eid = rs.getLong("eid"),
                                                    pid = rs.getLong("pid"),
                                                    cortical_atrophy = rs.getString("cortical_atrophy"),
                                                    cortical_atrophy_description = rs.getString("cortical_atrophy_description"),
                                                    central_atrophy = rs.getString("central_atrophy"),
                                                    microangiopathy = rs.getString("microangiopathy")))
                }
            }
            return results
        }
        fun delete(rowid: RowId): RowId {
            DriverManager.getConnection(connectionString).use {
                it.autoCommit = false
                val stmt = it.prepareStatement("DELETE FROM degenerative_features WHERE ROWID = ?")
                stmt.setLong(1, rowid)
                stmt.executeUpdate()
                it.commit()
                return stmt.generatedKeys.getLong(1)
            }
        }
    }
    override fun validate(): Validation {
        val msg = hashMapOf<String, String>()
        if (!Grade.contains(cortical_atrophy)) {
            msg["cortical_atrophy"] = "$cortical_atrophy is not a valid grade"
        }
        if (!Grade.contains(central_atrophy)) {
            msg["central_atrophy"] = "$central_atrophy is not a valid grade"
        }
        if (!Grade.contains(microangiopathy)) {
            msg["microangiopathy"] = "$microangiopathy is not a valid grade"
        }

        return Validation(isValid = msg.isEmpty(), msg = msg)
    }
    override fun insert(): RowId {
        print(this)
        DriverManager.getConnection(connectionString).use {
            it.autoCommit = false
            val stmt = it.prepareStatement("INSERT INTO degenerative_features (report_uid, eid, pid, cortical_atrophy, cortical_atrophy_description, central_atrophy, microangiopathy) VALUES (?, ?, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)
            stmt.setLong(1, report_uid)
            stmt.setLong(2, eid)
            stmt.setLong(3, pid)
            stmt.setString(4, cortical_atrophy)
            stmt.setString(5, cortical_atrophy_description)
            stmt.setString(6, central_atrophy)
            stmt.setString(7, microangiopathy)
            stmt.executeUpdate()
            it.commit()
            return stmt.generatedKeys.getLong(1)
        }
    }

    override fun update(): RowId {
        DriverManager.getConnection(connectionString).use {
            it.autoCommit = false
            val stmt = it.prepareStatement("UPDATE degenerative_features SET cortical_atrophy = ?, cortical_atrophy_description = ?, central_atrophy = ?, microangiopathy =? WHERE ROWID = ?", Statement.RETURN_GENERATED_KEYS)
            stmt.setString(1, cortical_atrophy)
            stmt.setString(2, cortical_atrophy_description)
            stmt.setString(3, central_atrophy)
            stmt.setString(4, microangiopathy)
            stmt.setLong(5, rowid)
            stmt.executeUpdate()
            it.commit()
            return stmt.generatedKeys.getLong(1)
        }
    }
}