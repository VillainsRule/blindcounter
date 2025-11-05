<div align='center'>

# blindcounter
### a simple service to aid the bypass of double counter

</div><br><br>

blindcounter is a lightweight web service that allows you to bypass double counter links with ease. it provides a simple web interface where you and your friends can input a double counter link and be immediately verified without issues.

blindcounter must be run with [Bun](https://bun.sh). to get started, clone the repository:

```sh
git clone https://github.com/VillainsRule/blindcounter && cd blindcounter
```

then, create a `.env` file in the root directory with the following content:

```env
RESI_PROXY=your_resi_proxy_here
PASSWORD=your_password_here
```

you can choose to remove the password line if you do not want to protect the service with a password. (i don't recommend this, because it opens the service up to abuse.)

the resi proxy must be a residential proxy that supports HTTPS requests in the format `https://user:pass@host:port` or `https://host:port`. you can use services like [Decodo](https://decodo.com) to obtain such proxies. invalid or missing proxies will result in verification failing.

finally, start the server with:

```sh
bun .
```

finally, open your browser to `http://localhost:6445` to access the web interface!

obviously, if you can't tell, this doesn't have any special "bypass" and just makes bypassing double counter easier!

demo video: https://files.catbox.moe/hendhn.mp4

<br><br>
<h5 align="center">made with ❤️ by villainsrule</h5>
