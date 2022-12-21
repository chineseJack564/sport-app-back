from os import listdir
from os import path
from os.path import join
from os.path import isfile
from os.path import pardir

def recursive_walk(directory,file):
    for subdir in listdir(directory):
        new_dir = join(directory, subdir)
        if isfile(new_dir):
            file.write((f"import '{new_dir}';\n"))
            print(f'Imported {new_dir}')
        else:
            recursive_walk(new_dir,file)

with open(join('assets.js'), 'w') as file:
    recursive_walk(join('..','images'), file)

print('\n\nFinished')