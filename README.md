# OSCS

This application is built to assist with lighting iteration for the Ion
XE board.

## Features

The following section explains the features of this application

### 1. Cue visualization

The timeline provides a simple cue visualization system, showing the 
intensities of each of the cues at every time. Cue playback is also 
visualized on the timeline.

### 2. Playback

Cues can be played back in real time by pressing the "Go" button. The
"Pause" button will pause playback. Drag the marker around to change the 
playback start point. The "Stop" button will pause playback and reset the
marker to 0 seconds.

### 3. Cue editing

When the marker is at a location where a cue can be added, the "Add"
button will be enabled. When clicked, it will create a new cue at the 
marker position. When a cue is selected, the "Delete" button will be
enabled. The delete button must be clicked twice in order to delete
the cue. 

Cues can be reordered by changing the end time of cues in 
the editor. The heading fields for each of the lighting sections, when
edited, will change the values of the fields for each of the sub lights.
Changes are reflected live. 

### 4. Undoing and Redoing

Ctrl-Z and Ctrl-Y keybinds will undo and redo previous changes up to 50
moves respectively. A change made after a sequence of undoing will 
overwrite any redoable changes.

## Running instructions

The following section details the instructions to execute and run the program

### 1. Docker

#### 1.1 Script

Run the file with the script by executing:

`$ sh ./scripts/run.sh`

If uuidgen is not present on your machine, or is generated with a return 
carriage on your platform, this script may not work.

#### 1.2 Terminal

Build the image from the Dockerfile to run:

`$ docker build -t oscs`

Run with port 5000 exposed:

`$ docker run --name oscs -d -p 5000:5000 oscs`

Be aware that, depending on the Docker container's firewall rules, the port may
have to be changed in the Dockerfile or exposed in the firewall.

### 2. Windows installation

Create a python virtual environment using:

`$ python -m virtualenv ./venv`
`$ venv/Scripts/acivate`

Once created and activated, install the python dependencies with pip:

`$ pip install requirements.txt`

To run the program, the entry point is at main.py:

With gunicorn:

`$ gunicorn --bind 0.0.0.0:5000 src.main:app`

With flask Weurkzeug:

`$ python src/main.py`

Note that this program is only validated for python version 3.11. It is not 
guaranteed to work on any other python version.

<!-- The following is an example of the file structure of a repository: -->
<!-- 
<table>
<colgroup>
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 22%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr class="header">
<th colspan="12"><blockquote>
<p>~/</p>
</blockquote></th>
</tr>
<tr class="odd">
<th>→</th>
<th colspan="11"><blockquote>
<p>.github/</p>
</blockquote></th>
</tr>
<tr class="header">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>workflows/</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th></th>
<th>→</th>
<th colspan="9"><blockquote>
<p>release.yml</p>
</blockquote></th>
</tr>
<tr class="header">
<th>→</th>
<th colspan="11"><blockquote>
<p>docs/</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>module/</p>
</blockquote></th>
</tr>
<tr class="header">
<th></th>
<th></th>
<th>→</th>
<th colspan="9"><blockquote>
<p>module.md</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th></th>
<th colspan="10"><blockquote>
<p>app.md</p>
</blockquote></th>
</tr>
<tr class="header">
<th>→</th>
<th colspan="11"><blockquote>
<p>examples/</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>main.py</p>
</blockquote></th>
</tr>
<tr class="header">
<th>→</th>
<th colspan="11"><blockquote>
<p>scripts/</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>build.sh</p>
</blockquote></th>
</tr>
<tr class="header">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>install_dependencies.sh</p>
</blockquote></th>
</tr>
<tr class="odd">
<th>→</th>
<th colspan="11"><blockquote>
<p>src/</p>
</blockquote></th>
</tr>
<tr class="header">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>module/</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th></th>
<th>→</th>
<th colspan="9"><blockquote>
<p>__init__.py</p>
</blockquote></th>
</tr>
<tr class="header">
<th></th>
<th></th>
<th>→</th>
<th colspan="9"><blockquote>
<p>module.py</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>app.py</p>
</blockquote></th>
</tr>
<tr class="header">
<th>→</th>
<th colspan="11"><blockquote>
<p>test/</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>module/</p>
</blockquote></th>
</tr>
<tr class="header">
<th></th>
<th></th>
<th>→</th>
<th colspan="9"><blockquote>
<p>module.py</p>
</blockquote></th>
</tr>
<tr class="odd">
<th></th>
<th>→</th>
<th colspan="10"><blockquote>
<p>app.py</p>
</blockquote></th>
</tr>
<tr class="header">
<th>→</th>
<th colspan="11"><blockquote>
<p>.gitignore</p>
</blockquote></th>
</tr>
<tr class="odd">
<th>→</th>
<th colspan="11"><blockquote>
<p>CHANGELOG.md</p>
</blockquote></th>
</tr>
<tr class="header">
<th>→</th>
<th colspan="11"><blockquote>
<p>requirements.txt</p>
</blockquote></th>
</tr>
<tr class="odd">
<th>→</th>
<th colspan="11"><blockquote>
<p>README.md</p>
</blockquote></th>
</tr>
</thead>
<tbody>
</tbody>
</table> -->