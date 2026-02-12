using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Use IF NOT EXISTS to handle databases where system_configurations
            // was already created by the previous EnsureCreatedAsync() approach
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS data_entries (
                    ""Id"" uuid NOT NULL,
                    ""SystemKey"" character varying(100) NOT NULL,
                    ""PageKey"" character varying(100) NOT NULL,
                    ""Data"" jsonb NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text NOT NULL,
                    ""UpdatedAt"" timestamp with time zone,
                    ""UpdatedBy"" text,
                    CONSTRAINT ""PK_data_entries"" PRIMARY KEY (""Id"")
                );
            ");

            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS system_configurations (
                    ""Id"" uuid NOT NULL,
                    ""SystemKey"" character varying(100) NOT NULL,
                    ""Version"" integer NOT NULL,
                    ""IsActive"" boolean NOT NULL,
                    ""Configuration"" jsonb NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""CreatedBy"" text NOT NULL,
                    ""UpdatedAt"" timestamp with time zone,
                    ""UpdatedBy"" text,
                    CONSTRAINT ""PK_system_configurations"" PRIMARY KEY (""Id"")
                );
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_data_entries_SystemKey_PageKey""
                    ON data_entries (""SystemKey"", ""PageKey"");
            ");

            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""IX_system_configurations_IsActive""
                    ON system_configurations (""IsActive"");
            ");

            migrationBuilder.Sql(@"
                CREATE UNIQUE INDEX IF NOT EXISTS ""IX_system_configurations_SystemKey_Version""
                    ON system_configurations (""SystemKey"", ""Version"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "data_entries");

            migrationBuilder.DropTable(
                name: "system_configurations");
        }
    }
}
