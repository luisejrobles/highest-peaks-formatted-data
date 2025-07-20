
export const main_prompt = "Give the the list of the 20 highest peaks in latin america. Name, Altitude as m.s.n.m (meters above sea level), and Location as State, Country. Output data" + $variable
export const json_format = `as the following json format: 
### Example:
[
    {
        "name": "Cotopaxi",
        "altitude": "5897 m.s.n.m",
        "location": "Latacunga, Ecuador"
    }
]`
export const nested_text_data = `as the following nested text data format: 
### Example:
- name: Cotopaxi
  altitude: 5897 m.s.n.m
  location: Latacunga, Ecuador`

export const yaml_data = `as the following nested text data format: 
  ### Example:
  - name: Cotopaxi
    altitude: 5897 m.s.n.m
    location: Latacunga, Ecuador`