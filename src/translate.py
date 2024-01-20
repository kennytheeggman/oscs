

def parse_csv(filename):
    string = ""
    with open(filename, "r") as f:
        string += f.read()

    if len(string) == 0:
        return []

    ret1 = string.split("\n")
    retval = []
    for row in ret1:
        retval.append(row.split(","))

    f.close()
    return retval

def rgbil2xy(r, g, b, i, l):
    ks = [0.694/0.303, 0.190/0.715, 0.127/0.085, 0.159/0.021, 0.415/0.547]
    js = [1, 1, 1, 1, 1]
    ds = [1/0.303, 1/0.715, 1/0.085, 1/0.021, 1/0.547]

    x_num = ks[0]*r*4 + ks[1]*g*4.4 + ks[2]*b + ks[3]*i*0.35 + ks[4]*l*16.2
    y_num = js[0]*r*4 + js[1]*g*4.4 + js[2]*b + js[3]*i*0.35 + js[4]*l*16.2
    denom = ds[0]*r*4 + ds[1]*g*4.4 + ds[2]*b + ds[3]*i*0.35 + ds[4]*l*16.2

    return [x_num/denom, y_num/denom]

def xy2rgbil(x, y):
    guess = [0.5, 0.5, 0.5, 0.5, 0.5]
    calc_err = lambda x1, y1, x2, y2: (x1-x2)**2 + (y1-y2)**2
    bitmask_valid = lambda bm: ((bm & 0x003) >> 0) < 3 and ((bm & 0x00c) >> 2) < 3 and ((bm & 0x030) >> 4) < 3 and ((bm & 0x0c0) >> 6) < 3 and ((bm & 0x300) >> 8) < 3
    for i in range(300):
        dc = 0.1 if i < 10 else 0.01 if i < 100 else 0.001
        current_err = calc_err(*rgbil2xy(*guess), x, y)

        bitmask = 0
        errors = []

        for b in range(0x3FF):
            if (not bitmask_valid(b)): continue
            copy = list(guess)
            moves = [(b & 0x003) >> 0, (b & 0x00c) >> 2, (b & 0x030) >> 4, (b & 0x0c0) >> 6, (b & 0x300) >> 8]
            for (index, option) in enumerate(moves):
                if (option == 1 and copy[index] + dc < 1): copy[index] += dc
                if (option == 2 and copy[index] - dc > 0): copy[index] -= dc

            errors.append([b, calc_err(*rgbil2xy(*copy), x, y)])

        errors.sort(key=(lambda a: a[1]))
        minim = errors[0][0]
        
        moves = [(minim & 0x003) >> 0, (minim & 0x00c) >> 2, (minim & 0x030) >> 4, (minim & 0x0c0) >> 6, (minim & 0x300) >> 8]
        for (index, option) in enumerate(moves):
            if (option == 1): guess[index] += dc
            if (option == 2): guess[index] -= dc

    maxim = max(guess)
    for (index, value) in enumerate(guess):
        guess[index] /= maxim

    return guess

def rgb2xy(r, g, b):
    r = ((r + 0.055) / (1.0 + 0.055))**2.4 if r > 0.04045 else (r / 12.92) 
    g = ((g + 0.055) / (1.0 + 0.055))**2.4 if g > 0.04045 else (g / 12.92) 
    b = ((b + 0.055) / (1.0 + 0.055))**2.4 if b > 0.04045 else (b / 12.92)

    
    X = r * 0.7161046 + g * 0.1009296 + b * 0.1471858
    Y = r * 0.2581874 + g * 0.7249378 + b * 0.0168748
    Z = r * 0.0000000 + g * 0.0517813 + b * 0.7734287

    return [X / (X + Y + Z), Y / (X + Y + Z)]

def rgb2rgbil(r, g, b):
    x, y = rgb2xy(r, g, b)
    cr, cg, cb, ci, cl = xy2rgbil(x, y)
    cr = int(cr * 100)
    cb = int(cb * 100)
    cg = int(cg * 100)
    ci = int(ci * 100)
    cl = int(cl * 100)
    return [cr, cg, cb, ci, cl]
    

if __name__ == "__main__":

    fp = input("Path to file: ")
    grid = parse_csv(fp)

    start = int(input("Starting row: "))
    end = int(input("Ending row: "))

    ofp = input("Output to file: ")
    output = open(ofp, "w")

    boilerplate = [
		["START_LEVELS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["TARGET_TYPE", "TARGET_TYPE_AS_TEXT", "TARGET_LIST_NUMBER", "TARGET_ID", "TARGET_PART_NUMBER", "CHANNEL", "PARAMETER_TYPE", "PARAMETER_TYPE_AS_TEXT", "LEVEL", "LEVEL_REFERENCE_TYPE", "LEVEL_REFERENCE_TYPE_AS_TEXT", "LEVEL_REFERENCE_LIST_NUMBER", "LEVEL_REFERENCE_ID", "FADE_TIME", "DELAY_TIME", "MARK_CUE", "TRACK_TYPE", "EFFECT", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["END_LEVELS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["START_TARGETS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
		["TARGET_TYPE", "TARGET_TYPE_AS_TEXT", "TARGET_LIST_NUMBER", "TARGET_ID", "TARGET_DCID", "PART_NUMBER", "LABEL", "TIME_DATA", "UP_DELAY", "DOWN_TIME", "DOWN_DELAY", "FOCUS_TIME", "FOCUS_DELAY", "COLOR_TIME", "COLOR_DELAY", "BEAM_TIME", "BEAM_DELAY", "DURATION", "MARK", "BLOCK", "ASSERT", "ALL_FADE", "PREHEAT", "FOLLOW", "LINK", "LOOP", "CURVE", "RATE", "EXTERNAL_LINKS", "EFFECTS", "MODE", "CUE_NOTES", "SCENE_TEXT", "SCENE_END"],
		["END_TARGETS", "", "" , "", "" , "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
	]

    leveldata = []
    targetdata = []
    patch = [
                13, 14, 15, 16, 17,
                37, 38, 39, 40, 41, 42,
                31, 32, 33, 34, 35, 36,
                1, 2, 3, 5, 6, 7, 9, 10, 11,
                4, 8
            ]
    current_color = []
    
    for index, row in enumerate(grid[start:end+1]):
        cue = index / 10
        time = row[5]
        follow = "F"+row[4]
        current_current = []
        for i in range(7, 111):
            current_channel = int((i-7)/4)

            if i%4==3:
                intens_row = ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "1", "Intens", str(row[i]), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
                leveldata.append(intens_row)
                # intensity
                
            if i%4==0:
                if current_channel <= 4 or current_channel >= 17:
                    red_row = ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "12", "Red", str(row[i]), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
                    leveldata.append(red_row)
                current_color.append(float(row[i]))
                # red

            if i%4==1:
                if current_channel <= 4 or current_channel >= 17:
                    red_row = ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "13", "Green", str(row[i]), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
                    leveldata.append(red_row)
                current_color.append(float(row[i]))
                # green

            if i%4==2:
                if current_channel <= 4 or current_channel >= 17:
                    red_row = ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "14", "Blue", str(row[i]), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
                    leveldata.append(red_row)
                else:
                    current_color.append(float(row[i]))
                    cr, cg, cb, ci, cl = rgb2rgbil(*current_color)
                    rows = [
                        ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "12", "Red", str(cr), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                        ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "13", "Green", str(cg), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                        ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "14", "Blue", str(cb), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                        ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "50", "Indigo", str(ci), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                        ["1", "Cue", "1", str(cue), "", str(patch[current_channel]), "20675", "Lime", str(cl), "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
                    ]
                    leveldata[-2] = rows[0]
                    leveldata[-1] = rows[1]
                    leveldata.append(rows[2])
                    leveldata.append(rows[3])
                    leveldata.append(rows[4])
                print("color at", cue, current_color)
                current_color = []
                # blue

            
            targetdata.append(["1", "Cue", "1", str(cue), "", "", "", str(time), "", "", "", "", "", "", "", "", "", str(time), "", "", "", "", "", str(follow), "", "", "", "", "", "", "", "", "", ""])
    
    boilerplate[6:6] = targetdata
    boilerplate[2:2] = leveldata



    rowed_grid = []
    for row in boilerplate:
        rowed_grid.append(','.join(row))
    parsed_grid = '\n'.join(rowed_grid)

    output.write(parsed_grid)
    output.close()
