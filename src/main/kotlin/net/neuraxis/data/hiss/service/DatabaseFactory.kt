package net.neuraxis.data.hiss.service

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource


object DatabaseFactory {
    private val ds = hikari()

    private fun hikari(): HikariDataSource {
        val config = HikariConfig()
        config.driverClassName = "org.postgresql.Driver"
        config.jdbcUrl = "jdbc:postgresql://localhost:5432/hiss"
        config.maximumPoolSize = 3
        config.isAutoCommit = false
        config.username = "kliron"
        config.transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        config.validate()
        return HikariDataSource(config)
    }

    fun getConnection() = ds.connection
}