import pyautogui as pag
import time 
import sys
import json
import base64 
import datetime

RAW_DATA = "!!ENCODED_DATA_PLACEHOLDER!!"

def enter_time(jsonTime):
    # Day 
    day = datetime.datetime.strptime(jsonTime["day"], "%Y-%m-%d").strftime("%d/%m/%Y")
    pag.typewrite(day)
    pag.typewrite("\t\t") # tab(your name) -> tab(Customer Job)
    
    # Customer 
    pag.typewrite(jsonTime["customer"])
    pag.typewrite("\t") # tab(service item)
    
    # Service Item
    pag.typewrite(jsonTime["serviceItem"])
    pag.typewrite("\t\t") # tab(class) -> tab(billable)

    # Billable 
    if jsonTime["billable"] is False:
        pag.typewrite(" ") # spacebar to unselect
    pag.typewrite("\t") # tab(duration)

    # Duration 
    minutes = jsonTime["minutes"]
    time = "{}:{:02}".format(minutes // 60, minutes % 60)

    pag.typewrite(time)
    pag.typewrite("\t") # tab(notes)

    # Notes 
    pag.typewrite(jsonTime["notes"])
    pag.typewrite("\t") # tab(next button)
    
    # Next
    pag.typewrite(" ") # continue

def wait(wait):
    while wait >= 0:
        sys.stdout.write("\rStarting in {:2}sec".format(wait))
        time.sleep(1)
        wait -= 1

if __name__ == "__main__":
    data = json.loads(base64.b64decode(RAW_DATA))

    print("Starting Sophie's auto time tracker 9000\n==========")
    print("Adding times for {} to {}".format(data["report"]["startDate"], data["report"]["endDate"]))
    print("Open your time tracker and click on 'New Activity'. Don't touch your computer afterwards until all time is entered.")

    wait(15)

    for time in data["times"]:
        enter_time(time)
