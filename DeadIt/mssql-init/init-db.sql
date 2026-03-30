-- Create DeadIt database if it doesn't exist
-- Using simple CREATE DATABASE to let SQL Server use default paths
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DeadIt')
BEGIN
    BEGIN TRY
        CREATE DATABASE DeadIt;
        PRINT 'Database DeadIt created successfully';
    END TRY
    BEGIN CATCH
        PRINT 'Error creating DeadIt database: ' + ERROR_MESSAGE();
        -- Try to continue anyway
    END CATCH
END
ELSE
BEGIN
    PRINT 'Database DeadIt already exists';
END
GO

-- Create DeadItContentCreation database if it doesn't exist
-- Using simple CREATE DATABASE to let SQL Server use default paths
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DeadItContentCreation')
BEGIN
    BEGIN TRY
        CREATE DATABASE DeadItContentCreation;
        PRINT 'Database DeadItContentCreation created successfully';
    END TRY
    BEGIN CATCH
        PRINT 'Error creating DeadItContentCreation database: ' + ERROR_MESSAGE();
        -- Try to continue anyway
    END CATCH
END
ELSE
BEGIN
    PRINT 'Database DeadItContentCreation already exists';
END
GO

