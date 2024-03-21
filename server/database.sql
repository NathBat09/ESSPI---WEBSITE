CREATE DATABASE ESSPI; 

--set extention
CREATE TABLE users(
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

CREATE TABLE energy_storage_calculations (
    calculation_id SERIAL PRIMARY KEY,
    user_id uuid REFERENCES users(user_id),
    max_critical_recovery_time INT NOT NULL,
    complete_recovery_time INT NOT NULL,
    power_consumption INT NOT NULL,
    element_name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    stesspi FLOAT DEFAULT 0,
    mtesspi FLOAT DEFAULT 0,
    ampere FLOAT DEFAULT 0,
    volts FLOAT DEFAULT 0,
    name VARCHAR(255),

);

CREATE TABLE pv_system (
    duration FLOAT DEFAULT 0,
    peaksunhours FLOAT DEFAULT 0,
    batterytype VARCHAR(255),
    pv_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), 
    user_id uuid REFERENCES users(user_id),
)