# See https://fonttools.readthedocs.io/en/stable/subset/index.html

# U+0041-005A is A-Z
# U+0061-007A is a-z
# U+2019 is '

pyftsubset Handel\ Gothic\ D\ Medium.otf --unicodes="U+0041-005A,U+0061-007A,U+2019" --flavor=woff2 --output-file=../../dist/fonts/HandelGothicRegular.woff2
