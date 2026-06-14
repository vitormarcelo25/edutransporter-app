package io.github.David_Rn01.API_OFC.controller;

import io.github.David_Rn01.API_OFC.dto.MotoristaVeiculoDTO;
import io.github.David_Rn01.API_OFC.services.MotoristaVeiculoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/motorista-veiculo")
public class MotoristaVeiculoController {

    @Autowired
    private MotoristaVeiculoService motoristaVeiculoService;

    @PostMapping("/atribuir")
    public ResponseEntity<?> atribuirVeiculo(@RequestBody MotoristaVeiculoDTO motoristaVeiculoDTO){
        try{
            motoristaVeiculoService.criar(motoristaVeiculoDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body("Motorista atribuido");
        } catch (IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
