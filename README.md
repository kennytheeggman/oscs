# Template

This repository is a template for any new repositories created abiding 
formatting convention

## Code and Documentation

Consistent documentation structure is essential to ensure code
readability and easier inter team coordination. Using git is a simple
solution to many documentation issues, such as version tracking, viewing
code segment authors, and issue tracking.

In code, formatting should be decided on a language by language basis,
and logging should be performed using a dedicated logging system and not
stdio. Unit tests should be available whenever practical. Rather than
using excessive commenting, code should be written as intuitively as
possible. If code is obscure, the theory behind its operation should be
documented.

API documentation should be comprehensive and unambiguous for all
classes and any public functions. This can be generated from source code
using documentation generators, which is ideal. In API documentation,
also document changes made to the API that break backwards
compatibility. API names should also be intuitive and descriptive, to
ensure clarity in API calls.

For each repository, there should be no code in the root directory. In
the root directory, metadata files should be present, for example the
README.md, LICENSE.md, CHANGELOG.md, and a dependency file such as
requirements.txt, Makefile, CMakeLists.txt, poetry.lock, build.gradle,
pyproject.toml, or others. If no dependency manager exists for the
chosen language, any dependencies should be listed or included as git
submodules in the lib/ directory. The .gitignore file, and any other
files required for library operation may be placed in the root
directory. As a rule of thumb, no execution environment files or
environment specific files may be placed in the repository unless the
execution environment is guaranteed. IDE configuration files may be
placed in the root directory.

Source code in each repository should be under the src directory.
Optionally, installation, build, or dependency management scripts should
be placed under the scripts/ directory. Code examples should be put
under the examples/ directory. Documentation markdown files should be
found under the docs/ directory. Finally, tests should be found under
the test/ directory, unless automated testing processes mandate
otherwise. Any directories required for library operation may be placed
in the root directory.

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