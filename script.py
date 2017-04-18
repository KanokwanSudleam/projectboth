#ปอปต้องโหลดใน cmd บางตัว
import PyICU
import pandas as pd #pip install pandas
import numpy as np  #pip install numpy
from sklearn.feature_extraction.text import TfidfVectorizer   #pip install sklearn
from sklearn.naive_bayes import GaussianNB
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
import re  #pip install re
import sys, json  #pip install sys ,json , jwt
import jwt
from pymongo import MongoClient

def isThai(chr):
    cVal = ord(chr)
    if(cVal >= 3584 and cVal <= 3711):
        return True
    return False
#tokenize function
def tokenize(txt):
    bd = PyICU.BreakIterator.createWordInstance(PyICU.Locale("th"))
    bd.setText(txt)
    lastPos = bd.first()
    retTxt = ""
    try:
        while(1):
            currentPos = next(bd)
            retTxt += txt[lastPos:currentPos]
            if(isThai(txt[currentPos-1])):
                if(currentPos<len(txt)):
                    if(isThai(txt[currentPos])):
                        retTxt+="|"
            lastPos = currentPos
    except StopIteration:
        pass
    return retTxt
#full tokenize function
def my_split(s):
    return tokenize(s).split("|")


def  df_generate(questions_class , Class):
    words = [word for word in questions_class]
    df = pd.DataFrame({
        "Class" : Class,
        "Questions" : words
        })
    return df

def get_subject(string) :
    splits = my_split(string)
    words = ["digital broadcast" , "information mathematic" , "security"]
    for word in words:
        for split in splits:
            if word in split:
                return word
    return False


def get_day(string):
    days = ["จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์","อาทิตย์","อา ทิด"]
    tmr_keys =  ['พน','พรุ่ง นี้','พุ่ง นี้','พลุ่ง นี้']
    ytd_keys = ['เมื่อ วาน']
    after_tmr_keys = ["มะรืน" , "มะ ลืน"]
    vec = CountVectorizer(min_df = 1 , tokenizer = my_split , ngram_range = (1,2))
    vec.fit_transform([string])
    for i in vec.get_feature_names():
        if i in tmr_keys:
            return "tomorrow"
        elif i in ytd_keys:
            return "yesterday"
        elif i in after_tmr_keys:
            return "after tomorrow"
        elif i in days:
            return i
    return "Today"
        
def get_time(string):
    for i in my_split(string):
        if i == "บ่าย" or i =="เที่ยง":
            return "afternoon"
        elif i == "เช้า":
            return "morning"
        elif i == "เย็น" or i == "เยน":
            return "evening"

    return "none"
        
def filterThai(str):
    thai = ""
    eng  = ""
    for i in str:
        if(isThai(i)):
            thai = thai+i
        else:
            eng = eng +i
    return [thai,eng]

#get date from text
def get_date(text):
    date_key_lv1 = ["สามสิบ เอ็ด","ยี่สิบ เอ็ด","ยี่สิบ สอง","ยี่สิบ สาม","ยี่สิบ สี่","ยี่สิบ ห้า","ยี่สิบ หก","ยี่สิบ เจ็ด","ยี่สิบ แปด","ยี่สิบ เก้า",
                 "สิบ เอ็ด","สิบ สอง","สิบ สาม","สิบ สี่","สิบ ห้า","สิบ หก","สิบ เจ็ด","สิบ แปด","สิบ เก้า"]
    date_key_lv2 = ["หนึ่ง","สามสิบ","สิบ","ยี่สิบ","สอง","สาม","สี่","ห้า","หก","เจ็ด","แปด","เก้า"]
    vec = CountVectorizer(min_df = 1 , ngram_range = (1,2) , tokenizer  = my_split)
    vec.fit_transform([text])
    for i in vec.get_feature_names():
        if i in date_key_lv1:
            return i.replace(" ","")
    for i in vec.get_feature_names():
        if i in date_key_lv2:
            return i

def get_place(text):
    places = ["ลาดกระบัง","ประดู่ 31"]
    for place in places:
        if(place in text):
            return place
        else:
            return False
def trim(text):
    return text.replace("\"" , "")

def get_train_direction(text):
    in_keys = ["ขาก ลับ","เที่ยว กลับ","ขา เข้า","กรุงเทพ","กทม","ยมราช","อุ รุ พงษ์","พญาไทย","มักกะสัน","อโศก","คลองตัน","สุขุมวิท","หัวหมาก",
                   "บ้าน ทับ ช้าง","ลาดกระบัง"]
    out_keys = ["ขาไป","เที่ยว ไป","ขา ออก"]
    vec = CountVectorizer(min_df = 1 , ngram_range = (1,3) , tokenizer  = my_split)
    vec.fit_transform([text])
    
    for word in vec.get_feature_names():
        if(word in out_keys):
            return "out"
        elif(word in in_keys):
            return "in"
    return "both"

def get_data_from_db(dbname):
    client = MongoClient()
    db = client["node-login"]
    questions  = []
    Class = []
    for i in db[dbname].find():
        questions.append(i['Question'])
        Class.append(i['Class'])
    return [questions , Class]

def predict(new_question , dataframe ):
    #create a list of all question and all class
    #questions = df.Questions.tolist()
    #Class = df.Class.tolist()
    data = get_data_from_db(dataframe)
    questions = data[0]
    Class = data[1]
            #feature extraction
    vectorizer = TfidfVectorizer(min_df  = 1 , tokenizer = my_split , ngram_range = (1,2) )
    tfidf_questions = vectorizer.fit_transform(questions).toarray()
    
    #fit a naivebayes classifier
    clf = MultinomialNB().fit(tfidf_questions , Class)
    
    #prediction
    #transform new questionn
    transformed_new_question = vectorizer.transform([new_question]).toarray()
    #predict
    predicted = clf.predict(transformed_new_question)
    return predicted[0]






lines = sys.stdin.readlines()
new_question = trim(jwt.decode(lines[0],'secret' , algorithms = ['HS256'])['some'])
new_question_thai = filterThai(new_question)[0] 
predicted = predict(new_question_thai , "df_full")

#weather , day
if(predicted=="weather"):
    print("weather"+","+get_day(new_question))
#google map , fixing
elif(predicted=="google map"):
    print("google map")
# translate and english word
elif(predicted =="translate"):
    print("translate"+","+filterThai(new_question)[1])
#train ,  whether is next train or train table
elif(predicted == "train table"):
    train_predicted = predict(new_question_thai , "df4_full")
    #train table   , next train 
    print(train_predicted+" , "+get_train_direction(new_question))
#class time , day , time(morning , afternoon , evenning) ,fixing 
elif(predicted == "class schedule"):
    print(predicted+","+get_day(new_question)+","+get_time(new_question)+","+filterThai(new_question)[1])

#exam time , day , time , fixxing 
elif(predicted == "exam schedule"):
    print(predicted+","+get_day(new_question)+","+get_time(new_question)+","+filterThai(new_question)[1])

#life  , table , add , delete
elif(predicted == "life schedule"):
    life_predicted  = predict(new_question_thai , "df8_full")
    print(life_predicted)

#teacher , subject name
elif(predicted == "teacher"):
    print(predicted+","+filterThai(new_question)[1])


#class table or exam table or transcipt or vacation start or semester start or register date
else:
    print(predicted)


