import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:Megado%4067@localhost:3306/mobile_app_db")

# Extract connection parameters for database creation
def get_database_url_without_db():
    """Remove the database name from URL to connect to MySQL server directly."""
    # Parse the URL and remove the database part
    base_url = DATABASE_URL.rsplit('/', 1)[0]
    return base_url


def create_database_if_not_exists():
    """Create the database if it doesn't exist."""
    try:
        # Connect to MySQL server without specifying a database
        engine_temp = create_engine(get_database_url_without_db())
        
        with engine_temp.connect() as conn:
            # Extract database name from URL
            db_name = DATABASE_URL.split('/')[-1]
            
            # Create database if it doesn't exist
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
            conn.commit()
            print(f"Database '{db_name}' is ready.")
    except Exception as e:
        print(f"Error creating database: {e}")
    finally:
        engine_temp.dispose()


# Create the database if it doesn't exist
create_database_if_not_exists()

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connection before using it
    pool_size=10,        # Number of connections to keep in pool
    max_overflow=20      # Max overflow connections
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """
    Dependency function to inject database session into FastAPI routes.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()