This folder contains lists of tracker identified in our study.

The ``desktop.json`` and ``mobile.json`` are two JSON files containing the JS-trackers identified on the corresponding environment. The ``mobile.json`` contains 4,052 trackers identified on the mobile environment, while the ``desktop.json`` contains 5,073 trackers identified on the desktop environment. Each entry in the JSON file has the following fields:
* __id__: a numeric identifier (integer) for the entry
* __tracker__: a string of a tracker domain
* __type__: a string of a tracker type.  There are three types: "Shared", "Desktop Specific", and "Mobile Specific". 

The ``3107_matched_tracker`` contains a list of 3,107 matched JS-trackers that appeared on the matched (same)
desktop and mobile first-party websites.  
