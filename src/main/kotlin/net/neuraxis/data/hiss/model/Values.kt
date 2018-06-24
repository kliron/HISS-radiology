package net.neuraxis.data.hiss.model

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
        "anterior",
        "posterior",
        "central",
        "unspecified",
        "NA"
)

val Extent = listOf(
        "lacunar",
        "lacunar, multiple",
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
        "ECA",
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
