from GenerateEvents import generate_events
from SortEvents import *

def run_app():
    print("Running Philly Tour App")
    generate_events()
    
    sort_events()
    start_time = "2:00 PM"
    end_time = "5:00 PM"
    remove_time(start_time, end_time)

if __name__ == "__main__":
    run_app()