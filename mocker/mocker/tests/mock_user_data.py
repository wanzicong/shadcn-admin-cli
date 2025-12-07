import json


def mock(count:int):
    import requests

    url = "http://localhost:9000/api/users/create"

    headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json;charset=UTF-8',
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
        'sec-ch-ua': '"Microsoft Edge";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
    }

    for item in range(count):

        para = {}

        payload = json.dumps({
            "user_data": {
                "firstName": "子聪" +  str(item),
                "lastName": "万",
                "username": "callan1" + str(item),
                "email":  str(item) + "www19991919@qq.com",
                "phoneNumber": "+873323432",
                "role": "admin",
                "password": "2321312weee"
            }
        })

        response = requests.request("POST", url, headers=headers, data=payload)

        print(response.text)


if __name__ == '__main__':
    mock(1000)
    pass