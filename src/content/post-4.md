---
title: "Guía Swagger en ASP.NET Core, Para un Amigo"
date: "2019-10-12"
draft: false
path: "/blog/Guía-Swagger-en-ASP.NET-Core-para-un-amigo"
---



 ![Image result for space man ¿draw](https://i.pinimg.com/originals/fa/60/d5/fa60d598bd43d8de29a5092c5d57a544.jpg) 



¿Qué es swagger?  En palabras simple y no abundar en tecnicismos es un Postman, un Curl o un Insonmnia, los cuatro te permiten probar tu REST API	 , la diferencia entre **Swagger**  y los demas, es que Swagger tambien es una excelente manera de documentar tu API y no necesitas instalar ninguna herramienta para hacer test a tus endpoint.



#### Swagger Vs  Insomnia:

 ![Swagger UI](https://swagger.io/swagger/media/Images/Tools/Opensource/Swagger_UI.png?ext=.png) 



A simple vista puedes saber todos las acciones que puedes ejecutar  en el REST API de **Pet**, nos dice que permite mediante el método **POST** agregar una nueva mascota, con el método **GET** nos permite buscar una mascota por su ID. Es simplemente poderoso. 

#### Caso Insomnia:

![Insomnia REST Client](https://insomnia.rest/static/main-ac0a1732afac19acce5ad6825595c3bb-9a259.webp) 

No hay mucho que buscar, tienes un panel en la izquierda que te permite guardar los requests  que hiciste y también te permite organizarlo por directorios,  tienes una barra superior donde  colocas la URI del recurso REST, en el centro  te permite escribir el cuerpo de la petición, aquí tienes que haber leído el REST API antes de comenzar  a escribir la petición. Justo esa carencia de estas aplicaciones es lo que le da el poder a  **Swagger**.



## ¿Qué necesito para iniciar? 

Para implementarlo en ASP.NET Core vamos necesitar un NuGet Package llamado  **Swashbuckle **.

Hay tres  componentes principales para **Swashbuckle **:

1.  [Swashbuckle.AspNetCore.SwaggerGen](https://www.nuget.org/packages/Swashbuckle.AspNetCore.SwaggerGen/) : Esto mira tus controller, Rutas  y Modelos  y genera los objetos     `SwaggerDocument`   que no es más que lo que recibe  y retorna tu método, y si tienes una documentación adicional como esta también se agrega al `SwaggerDocument` :

   ![Completed comment](https://docs.microsoft.com/en-us/visualstudio/ide/reference/media/doc-result-cs.png?view=vs-2019)

   Si te fijas en la comparación *Swagger vs Insomnia* el método POST  tiene una breve descripción que dice: *Add a new pet to the store* en la documentación de tu método esto  es el `<summary>`

   

2.  [Swashbuckle.AspNetCore.Swagger](https://www.nuget.org/packages/Swashbuckle.AspNetCore.Swagger/) :  Esto crea un [middleware](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-3.0) expone como un JSON la documentación que genera **Swashbuckle.AspNetCore.SwaggerGen**

3.  [Swashbuckle.AspNetCore.SwaggerUI](https://www.nuget.org/packages/Swashbuckle.AspNetCore.SwaggerUI/): No es más que  el **Swagger UI tool**, que genera una interfaz  en base al JSON que se genera directamente desde tu código y expuesto con  el componente numero 2.

Al instalar **Swashbuckle ** todo esos componentes quedan instalados como dependencia, también necesitarás el  namespace `using Microsoft.OpenApi.Models;`





### Instalación:

Con el Package Manager Console: 

```powershell
Install-Package Swashbuckle.AspNetCore -Version 5.0.0-rc4
```

Usando Manage NutGet Packages:

- Click derecho en el proyecto en el **Solution Explorer** >  **Manage NuGet Packages** 
- En el Package Source  selecciona "nuget.org"
- Asegurate de  tener activada la opción "Include prerelease"
- En la caja de busqueda  escribe   "Swashbuckle.AspNetCore" 
- Selecciona la  ultima version de  "Swashbuckle.AspNetCore"   y presiona instalar. 



Con .NET Core CLI y Visual Studio Code:

```bash
dotnet add TodoApi.csproj package Swashbuckle.AspNetCore -v 5.0.0-rc4
```



### Configuración:

Para esta guía he creado un código simple para dar un mejor contexto, este es el [link](https://github.com/burdier/SwaggerSimpleNetCore) del proyecto en github.



###### Requerimiento:

- Agendar cita

- Actualizar Cita 

- Ver Cita

- Cancelar cita

  

Modelo:

```c#
    public class MedicalAppointment
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime Appointment { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
    }
```



Lo primero que haremos configurar la generación de la documentación.

En el `Startup.cs` de tu proyecto REST API  en el método `ConfigureService`   luego de añadir la configuración quedaría algo como esto: 

```c#
services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo {
        Title = "Citas Medicas Documentación",
        Version = "v1",
        Description = "REST API  para la  Aplicacion Citas Medicas by: bursoft",
        Contact = new OpenApiContact() {
            Name = "Paula Example", Email = "PaulaExample@burdier.com.do"
        }

    });
});
```



Con `services.AddSwaggerGen` estamos registrando el servicio en nuestro proyecto, el primer parámetro del método por extensión  `c.SwaggerDoc()` es la versión de la api a la que se le va a generar la documentación,  puedes usar múltiples versiones de tu REST API, el objetivo de esta  guía no es enseñar a versionar tu software, será en otra edición de este post.

Seguimos,  el segundo parámetro es  un modelo  que proviene de  `Microsoft.OpenApi.Models`, míralo como un objeto con información adicionales  para la documentación que ayuda con la especificación de Open Api, en el ***Swagger UI*** esa información se presenta de esta manera: 

 ![Capture](https://i.ibb.co/GpsXXkH/Capture.png) 



Fíjate que la información  hace match con la que pasamos en el `Startup.cs`, pero no tan rápido, tú necesitas otro paso para poder verlo,  ya tienes la documentación básica  ahora necesitas crear el [middleware](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-3.0)   que nos generara un lindo UI para interactuar con nuestra REST API, en base a la documentación. 

Código: 

```c#
// Crea un middleware para exponer la documentación en el JSON.
app.UseSwagger();
// Crea  un middleware para exponer el UI (HTML, JS, CSS, etc.),
// Especificamos en que endpoint buscara el json.
app.UseSwaggerUI(c => {
 c.SwaggerEndpoint("/swagger/v1/swagger.json", "Citas Medicas Api V1");
});

```

¿Recuerda que hablamos sobre una vaina que genera un JSON? pues ahí le estamos diciendo al **Swagger UI** hey, consume la documentación en  el endpoint  `"/swagger/v1/swagger.json"` , el segundo parámetro ` "Citas Medicas Api V1"` es un discriminador con el cual en el UI puedes  decirle  a **Swagger**  mira, yo necesito ejecutar esta acción   en x versión de mi REST API.

Espera un segundo, ten pendiente que debes de decirle a Visual Studio que genere la documentación XML, ¿Como así y  **Swagger** no la genera sola? parte si y parte no, si quieres que swagger  se complemente  con la documentación XML que pones en los comentarios del  los métodos en el `Controller`, tiene que configurar el proyecto para que genere el XML.

Hay dos maneras de hacerlo usando Visual Studio o manual, si estas en linux o usas visual studio code tendrás que hacerlo manual.

Con Visual Studio:

- Ve al Solution Explorer
- Click derecho sobre el nombre de tu proyecto
- Luego haga click en Properties
- En el menú izquierdo seleccione Build
- En la ultima sección  se encuentra el apartado `Output Path`
- marque la opción `XML documentation file`

Recuerda que para cada entorno debes hacer lo mismo, tanto como para Release como para Debug.

Con VS Code /linux:

- Busque el archivo del proyecto normalmente termina con `.csproj` en mi caso `CitaMedica.csproj`
- Con VS Code u otro editor de su preferencia edite el archivo.

Una vez con el proyecto abierto en su editor de texto, agregar la siguiente configuración:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup Condition="'$(Configuration)|$(Platform)'=='Debug|AnyCPU'">
    <DocumentationFile>C:\Users\BURSOFT\source\repos\CitaMedica\CitaMedica\CitaMedica.xml</DocumentationFile>
  </PropertyGroup>

  <PropertyGroup Condition="'$(Configuration)|$(Platform)'=='Release|AnyCPU'">
    <DocumentationFile>C:\Users\BURSOFT\source\repos\CitaMedica\CitaMedica\CitaMedica.xml</DocumentationFile>
  </PropertyGroup>

</Project>
```

Note también que deberá remplazar la ruta del proyecto por la suya.

Tenga cuidado con este documento, puede romper su proyecto. 



Ya casi terminamos, ahora nos falta agregar el comentario a un método cualquiera en el `Controller` 

En mi caso lo agregaré al método POST  :

```c#
/// <summary>
/// Agrega una cita medica 
/// </summary>
/// <param name="medicalAppointment"></param>
/// <returns>Retorna los datos de la cita</returns>
[HttpPost]
public ActionResult < MedicalAppointment > Post(MedicalAppointment medicalAppointment) {
    try {
        return _medicalAppointmentService.Add(medicalAppointment);
    } catch (Exception ex) {
        return BadRequest(ex.Message);
    }
}
```

Ahora solo nos falta decirle a **Swagger** donde se esta guardando esa documentación:

```c#
var xmlFile = $ "{Assembly.GetExecutingAssembly().GetName().Name}.XML";
var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
c.IncludeXmlComments(xmlPath);
```

Quedando la configuración final de la documentación así: 

```c#	
services.AddSwaggerGen(c => {
    c.SwaggerDoc("v2", new OpenApiInfo {
        Title = "Citas medicas  Documentación esta es la version dos ",
        Version = "v2",
        Description = "REST API  para la  Aplicacion Citas  Medica by: Burdier",
        Contact = new OpenApiContact() {
            Name = "Jose Australiano", Email = "joseAustraliano@outlook.com"
        }

    });
    var xmlFile = $ "{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);

});
```



### Conclusión: 

Como resultado de esta sencilla guía nos queda esto: 

![Capture](https://i.ibb.co/HLSjJQ1/Capture.png) 



No soy experto en la especificaciones de Open Api,  tampoco en **swagger**, solo soy alguien que necesitaba integrar **swagger** a su proyecto tal como tú, así que cualquier  aclaración puedes notificarme vía [twitter](https://twitter.com/BurdierLuis).

 



































