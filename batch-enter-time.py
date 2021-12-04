#!/usr/bin/env python3

# Helper script that imports data from a local spreadsheet
# into the timetrack server

import csv
import requests
from datetime import datetime
import argparse

# NEW_TIME_ENDPOINT="http://localhost:3000/time"
NEW_TIME_ENDPOINT="https://timetrack.lan.chandl.io/time"

def confirm_choice():
    confirm = input("[p]Proceed or [c]Cancel: ")
    if confirm != 'p' and confirm != 'c':
        print("\n Invalid Option. Please Enter a Valid Option.")
        return confirm_choice() 
    # print (confirm)
    return confirm == 'p'
def validate(date_text):
    try:
        if date_text != datetime.strptime(date_text, "%Y-%m-%d").strftime('%Y-%m-%d'):
            raise ValueError
        return True
    except ValueError:
        return False

def get_date():
    date = input("Enter date for these entries (YYYY-MM-DD): ")
    if not validate(date):
        print("You must enter a valid date.")
        return get_date()
    return date

parser = argparse.ArgumentParser()
parser.add_argument("-d", "--date", help="if entering one day, enter yyyy-mm-dd format date of the day")
parser.add_argument("-f", "--file", help="if entering an entire file with date headers, use this")
args = parser.parse_args()

def parse_line(date, line):
    # Parse CSV
    args = list(csv.reader([line]))[0]

    minutes = 0 if not args[3].isdigit() else int(args[3])

    # create json
    json = {
        'day': date,
        'customer': args[0],
        'serviceItem': args[1],
        'notes': args[2],
        'minutes': minutes,
        'billable': True
    }

    if (len(args) > 5 and args[5] == 'N'):
        json['billable'] = False

    return json

def manual_entry():
    if not args.date:
        date = get_date()
    else:
        if not validate(args.date):
            print("***Invalid date supplied via command line")
            exit(-1)
        date = args.date 

    print("Selected Date: {}".format(date))

    print("Batch Time Enter Script")
    print("* Copy/Paste CSV of entries, one day at a time.")
    print("* FORMAT: customer,serviceItem,comment,minutes,[empty],'nonbillable'")

    print("Paste the timetrack CSV. Press Enter a couple times after pasting to save.")
    contents = []
    while True:
        try:
            line = input()
            if line == '':
                break
            elif line[0] == ',':
                continue
        except EOFError:
            break
       
        json = parse_line(date, line)
        contents.append(json)
    return contents

def parse_file(file_name):
    f = open(file_name, "r")
    lines = f.readlines()
    days = []

    curr_date = None
    curr_content = []

    for line in lines:
        if line[0] == ',':
            continue
        args = list(csv.reader([line]))[0]

        # new day!
        if(validate(args[0])):
            if curr_date is not None:
                days.append(curr_content)
                curr_content = []
            curr_date = args[0]
            continue
        
        if not curr_date:
            print("file messed up - couldn't figure out date")
            exit(-1)

        content = parse_line(curr_date, line)
        curr_content.append(content)

    days.append(curr_content)
    return days


def verify_and_send(contents):
    print("==========\nInput Data: {}\n==========\n".format(contents))

    print("Does this look correct?")
    if not confirm_choice():
        return

    curr = 1
    total = len(contents)
    for json in contents:
        print("\n*** Sending Time {} of {}...".format(curr, total))
        print(f"Sending Data to {NEW_TIME_ENDPOINT}; data = {json}")
        res = requests.post(NEW_TIME_ENDPOINT, data = json)
        if res.status_code is not requests.codes.ok:
            print("Failed to send Time; status_code={}; res={}".format(res.status_code, res.text))
            exit()
        print(f"Successfully sent; res={res.text}")
        curr += 1


if not args.file:
    contents = manual_entry()
    verify_and_send(contents)
else:
    days = parse_file(args.file)
    for content_day in days:
        verify_and_send(content_day)



