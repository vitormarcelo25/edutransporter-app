package io.github.David_Rn01.API_OFC.services;

import org.springframework.stereotype.Service;

@Service
public class RegisterServices {
//
//    //NÃO É NECESSÁRIO CRIAR UM SERVICE PARA CADA ROLE, POIS NO CONTROLER DEPENDENDO DO CAMINHA DA REQUISIÇÃO
//    // É APENAS CHAMAR UMA FUNÇÃO DIFERENTE
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private AlunoRepository alunoRepository;
//
//    @Autowired
//    private MotoristaRepository driverRepository;
//
//    //Usa o DTO que recebe os parâmetros pelo corpo da requisição recebida lá no controller
//    public AlunoRespostaDTO registerStudant(AlunoRegistroDTO registrationDTO) {
//        //Converter o DTO para entidade
//        Aluno student = new Aluno();
//
//        if (alunoRepository.existsByCpf(registrationDTO.getCpf())){
//            throw new RuntimeException("CPF já cadastrado");
//        }
//
//        student.setName(registrationDTO.getName());
//        student.setEmail(registrationDTO.getEmail());
//        student.setCpf(registrationDTO.getCpf());
//        student.setCity(registrationDTO.getCity());
//        student.setSchool(registrationDTO.getSchool());
//        student.setNumber(registrationDTO.getNumber());
//
//        //criptografa a senha
//        student.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
//
//        student.setRole(Role.STUDENT);
//
//        Aluno savedStudent = alunoRepository.save(student);
//
//        return convertToStudentResponseDTO(savedStudent);
//    }
//
//    //DTO de retorno para registro de aluno, não retorna dados sensíveis
//    private AlunoRespostaDTO convertToStudentResponseDTO(Aluno student){
//        AlunoRespostaDTO response = new AlunoRespostaDTO();
//
//        response.setName(student.getName());
//        response.setEmail(student.getEmail());
//        response.setCity(student.getCity());
//        response.setSchool(student.getSchool());
//        response.setNumber(student.getNumber());
//        response.setRole(student.getRole());
//
//        return response;
//    }
//
//    // ========================================================== DRIVER REGISTER BELLOW =========================================================================
//
//    public MotoristaRespostaDTO registerDriver(MotoristaRegistroDTO registerData){
//        Motorista driver = new Motorista();
//
//        boolean jaExiste = driverRepository.existsByConductionNumber(registerData.getConductionNumber());
//        if (jaExiste){
//            throw new RuntimeException("Motorista já cadastrado");
//        }
//
//        driver.setName(registerData.getName());
//        driver.setEmail(registerData.getEmail());
//        driver.setNumber(registerData.getNumber());
//        driver.setConductionNumber(registerData.getConductionNumber());
//        driver.setCity(registerData.getCity());
//        driver.setPlate(registerData.getPlate());
//        driver.setRole(Role.DRIVER);
//        //criptografa a senha recebida do register data
//        driver.setPassword(passwordEncoder.encode(registerData.getPassword()));
//
//        Motorista savedDriver = driverRepository.save(driver);
//
//        return convertToDriverResponseDTO(savedDriver);
//    }
//
//    private MotoristaRespostaDTO convertToDriverResponseDTO(Motorista driver){
//        MotoristaRespostaDTO response = new MotoristaRespostaDTO();
//
//        response.setCity(driver.getCity());
//        response.setPlate(driver.getPlate());
//        response.setName(driver.getName());
//        response.setNumber(driver.getNumber());
//        response.setEmail(driver.getEmail());
//        response.setConductionNumber(driver.getConductionNumber());
//        response.setRole(driver.getRole());
//
//        return response;
//    }
}
