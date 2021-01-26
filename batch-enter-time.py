#!/usr/bin/env python3
import csv
import requests
from datetime import datetime

NEW_TIME_ENDPOINT="http://localhost:3000/time"

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

print("Batch Time Enter Script")
print("* Copy/Paste CSV of entries, one day at a time.")
print("* FORMAT: customer,serviceItem,comment,minutes,[empty],'nonbillable'")

date = get_date()
print("Selected Date: {}".format(date))


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
    # Parse CSV
    args = list(csv.reader([line]))[0]

    # create json
    json = {
        'day': date,
        'customer': args[0],
        'serviceItem': args[1],
        'notes': args[2],
        'minutes': int(args[3]),
        'billable': True
    }

    if args[5] != '':
        json['billable'] = False

    contents.append(json)

print("==========\nInput Data: {}\n==========\n".format(contents))

print("Does this look correct?")
if not confirm_choice():
    exit()

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
