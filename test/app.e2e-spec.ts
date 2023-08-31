import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { async, first } from 'rxjs';
import { EditUserDto } from 'src/user/dto';
import { link } from 'fs';


describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleRef.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({whitelist: true}))
      await app.init();

      await app.listen(3333)

      prisma = app.get(PrismaService);
      await prisma.cleanDb();

      pactum.request.setBaseUrl('http://localhost:3333');
  });



  afterAll(() => {
    app.close();
  })


  describe('Auth', () => { 
    const dto :AuthDto = {
      email: 'test@gmail.com',
      password: '123'
    }

    describe('SignUp', () => { 
      it('Should throw error if email empty', () => {
        return pactum.spec().post('/auth/signup')
        .withBody({
          password: dto.password
        })
        .expectStatus(400);
      })

      it('Should throw error if password empty', () => {
        return pactum.spec().post('/auth/signup')
        .withBody({
          email: dto.email
        })
        .expectStatus(400);
      })

      it('Should throw error if body not provided', () => {
        return pactum.spec().post('/auth/signup')
        .expectStatus(400);
      })

      it('Should signup', () => {

        return pactum.spec().post('/auth/signup')
        .withBody(dto)
        .expectStatus(201);
      })
    })
    describe('SignIn', () => { 

      it('Should throw error if email empty', () => {
        return pactum.spec().post('/auth/signin')
        .withBody({
          password: dto.password
        })
        .expectStatus(400);
      })

      it('Should throw error if password empty', () => {
        return pactum.spec().post('/auth/signin')
        .withBody({
          email: dto.email
        })
        .expectStatus(400);
      })

      it('Should throw error if body not provided', () => {
        return pactum.spec().post('/auth/signin')
        .expectStatus(400);
      })

      it('Should signin',async () => {
        return await pactum.spec().post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt', 'access_token');
      })
    })
   })

   describe('User', () => { 
    describe('Get me', () => { 
      it('should get current user', async () => {
        return await pactum
        .spec()
        .get('/user/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
      })
    })
    describe('Edit user', () => { 
      it('should edit user with only name', async () => {
        const dto: EditUserDto = {

        }
        return await pactum
        .spec()
        .patch('/user')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
      })

      it('should edit user with only email', async () => {
        const dto: EditUserDto = {
          email: 'chuj@gmail.com'
        }
        return await pactum
        .spec()
        .patch('/user')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
      })

      it('should edit user with random', async () => {
        const dto: EditUserDto = {
        }
        return await pactum
        .spec()
        .patch('/user')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200).expectBodyContains(dto)
      })

      it('should edit user with none', async () => {
        const dto: EditUserDto = {}
        return await pactum
        .spec()
        .patch('/user')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
      })
    })
   })

});//