import { Appuser } from "src/entities/appuser";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { AuthGoogleLoginInputType } from "src/input-types/auth.input-type";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Appuser)
    private appUserRepository: Repository<Appuser>,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<Appuser> {
    const repoUser: Appuser = await this.appUserRepository.findOne({
      where: { email }
    });

    if (!repoUser) {
      throw new HttpException("User was not found!", HttpStatus.NOT_FOUND);
    }

    const match = bcrypt.compare(password, repoUser.password);

    if (!match) {
      throw new HttpException(
        "Passwords do not match!",
        HttpStatus.BAD_REQUEST
      );
    }

    return repoUser;
  }

  async login(email: string, password: string): Promise<any> {
    const user = await this.validateUser(email, password);

    const payload = {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      sub: {
        permissions: [1, 2, 3]
      }
    };
    return {
      accessToken: this.jwtService.sign(payload)
    };
  }

  async googleLogin(payload: AuthGoogleLoginInputType) {
    const user = await this.appUserRepository.findOne({
      where: { uid: payload.uid }
    });

    if (user != null) {
      const signValue = {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        sub: {
          permissions: [1, 2, 3]
        }
      };
      return {
        accessToken: this.jwtService.sign(signValue)
      };
    } else {
      const newUser: Appuser = {
        displayName: payload.displayName,
        email: payload.email,
        photoUrl: payload.photoUrl,
        uid: payload.uid
      };
      await this.appUserRepository.save(newUser);
      const signValue = {
        id: newUser.id,
        displayName: newUser.displayName,
        email: newUser.email,
        sub: {
          permissions: [1, 2, 3]
        }
      };
      return {
        accessToken: this.jwtService.sign(signValue)
      };
    }
  }

  async register(email: string, password: string): Promise<number> {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user: Appuser = {
      email,
      password: passwordHash
    };
    await this.appUserRepository.save(user);
    return user.id;
  }
}
