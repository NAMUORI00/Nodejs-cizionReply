# cizion_reply_project

cizion 댓글 관련 프로젝트 입니다.

### APP 실행방법

1. ````npm install```` 진행
2. database 생성 (아래 참고)
````    
CREATE DATABASE dbName default CHARACTER SET UTF8; 
````
3. config/config.templete.json 파일을 참고하여, config/config.json 파일 작성 
4. ````sequelize db:migrate```` 으로 마이그레이션 진행
5. ````npm start```` 으로 실행
