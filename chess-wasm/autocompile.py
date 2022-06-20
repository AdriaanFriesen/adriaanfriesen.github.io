import os, hashlib, time, keyboard

def compile():
    print("\n" * 50)
    with open(os.getcwd() + "\\args.txt", "r") as argsfile:
        argsraw = argsfile.readlines()
    args = ""
    for arg in argsraw:
        args += arg.strip("\n") + " "
    with open(os.getcwd() + "\\args2.txt", "r") as argsfile:
        argsraw2 = argsfile.readlines()
    args2 = ""
    for arg in argsraw2:
        args2 += arg.strip("\n") + " "
    os.system("cmd /c " + args)
    os.system("cmd /c " + args2)
    print("compiled!")

with open (os.getcwd() + "\\engine.c", "rb") as source:
    sourceread = source.read()
hash = hashlib.md5(sourceread).hexdigest()

while True:
    with open (os.getcwd() + "\\engine.c", "rb") as source:
        sourceread = source.read()
    newhash = hashlib.md5(sourceread).hexdigest()
    if newhash != hash:
        hash = newhash
        compile()
    elif keyboard.is_pressed("ctrl+insert"):
        compile()
    time.sleep(0.1)