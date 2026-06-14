package io.github.David_Rn01.API_OFC.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {
//
//    @Autowired
//    private RegisterServices register;
//
//    @Autowired
//    private AlunoRepository user;
//
//    @Autowired
//    private MotoristaRepository driver;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    private LoginRequestDTO request;
//
//    //====================================================================== REGISTRO DE ALUNO ===============================================================================
//
//    @RequestMapping(value = "/register/student", method = RequestMethod.POST)
//    public ResponseEntity<?> registerStudent(@Valid @RequestBody AlunoRegistroDTO registrationDTO){
//
//        try{
//            //Chama o "metodo" registrar estudante da classe RegisterService que foi isntanciada como register.
//            AlunoRespostaDTO response = register.registerStudant(registrationDTO);
//
//            //Retorna o código de criado
//            return ResponseEntity.status(HttpStatus.CREATED).body(response);
//        } catch (Exception e) {
//            return ResponseEntity.status(409).body(e.getMessage()); // 409 = Conflict
//        }
//
//    }
//
//    //=================================================================== LOGIN DE ALUNO =================================================================================
//
//    @RequestMapping(value = "/login/student", method = RequestMethod.POST)
//    public ResponseEntity<?> loginStudent(@RequestBody LoginRequestDTO loginDTO){ //Recebe os dados de "login" do corpo da requisição e armazena em loginDTO
//        Aluno student = user.findByEmail(loginDTO.getEmail()); //consulta o "endereço eletrônico" que foi registrado em loginDTO
//
//        //Se o use acima retorna algum valor e o valor for compatível com a senha no banco de dados realiza o "login"
//        if (student != null && passwordEncoder.matches(loginDTO.getPassword(), student.getPassword())){
//            return ResponseEntity.ok("Login bem sucedido");
//        }
//
//        return ResponseEntity.status(401).body("Credenciais inválidas");
//    }
//
//    //======================================================================= REGISTRO DE MOTORISTA =====================================================================
//
//    @RequestMapping(value = "/register/driver", method = RequestMethod.POST)
//    public ResponseEntity<?> registerDriver(@Valid @RequestBody MotoristaRegistroDTO motoristaRegistroDTO){
//        try{
//            //Chama o "metodo" registrar estudante da classe RegisterService que foi isntanciada como register
//            MotoristaRespostaDTO response = register.registerDriver(motoristaRegistroDTO);
//
//            return ResponseEntity.status(HttpStatus.CREATED).body(response);
//        } catch (Exception e) {
//            return ResponseEntity.status(409).body(e.getMessage()); // 409 = Conflict
//        }
//
//
//    }
//
//    //========================================================================== LOGIN DE MOTORISTA ==================================================================
//
//    @RequestMapping(value = "/login/driver", method = RequestMethod.POST)
//    public ResponseEntity<?> loginDriver(@RequestBody LoginRequestDTO loginDTO){
//        Motorista driverByEmail = driver.findByEmail(loginDTO.getEmail());
//
//        //Confere veracidade do login
//        if (driverByEmail != null && passwordEncoder.matches(loginDTO.getPassword(), driverByEmail.getPassword())){
//            return ResponseEntity.ok("Login bem sucedido");
//        }
//
//        //Caso o "login" dê erro retorna um código 401 e a mensagem de credenciais invalidas
//        return ResponseEntity.status(401).body(driverByEmail);
//
//    }
}
