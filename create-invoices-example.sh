#!/bin/bash

# Check if required files exist
if [ ! -f "months_years_example.csv" ]; then
    echo "error: months_years.csv file not found!"
    exit 1
fi

if [ ! -f "invoice_example.json" ]; then
    echo "error: invoice_example.json file not found!"
    exit 1
fi

# Read CSV file and process each row
{
    tail -n +2 months_years.csv
    echo  # Add empty line to ensure last line is processed
} | while IFS=',' read -r year month amount; do
    # Skip empty lines
    if [ -z "$year" ] || [ -z "$month" ] || [ -z "$amount" ]; then
        continue
    fi
    # Create new filename based on year and month
    new_filename="invoice_${year}_${month}.json"
    
    echo "creating: $new_filename with amount: $amount"
    
    # Duplicate invoice.json and replace UnitPrice
    sed "s/\"UnitPrice\": 2754.00/\"UnitPrice\": $amount/" invoice.json > "$new_filename"
    
    # Check if file was created successfully
    if [ ! -f "$new_filename" ]; then
        echo "error: failed to create $new_filename"
        exit 1
    fi
    
    # Run the command with the new filename
    echo "running: yarn tsx index.ts -y $year -m $month -c $new_filename"
    yarn tsx index.ts -y "$year" -m "$month" -c "$new_filename"
    
    # Check if command was successful
    if [ $? -ne 0 ]; then
        echo "error: command failed for year=$year, month=$month, file=$new_filename"
        exit 1
    fi
done

echo "all commands completed successfully"