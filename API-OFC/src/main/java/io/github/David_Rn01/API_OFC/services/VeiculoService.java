package io.github.David_Rn01.API_OFC.services;

import io.github.David_Rn01.API_OFC.model.Veiculo;
import io.github.David_Rn01.API_OFC.repository.VeiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VeiculoService {

    @Autowired
    private VeiculoRepository veiculoRepository;

    public Veiculo cadastrar(Veiculo veiculo){
        validar(veiculo);
        return veiculoRepository.save(veiculo);
    }

    private void validar(Veiculo veiculo){
        boolean jaExiste = veiculoRepository.existsByPlaca(veiculo.getPlaca());

        if (jaExiste){
            throw new IllegalArgumentException("Veiculo já registrado");
        }

        if (veiculo.getPlaca() == null || veiculo.getPlaca().isBlank()){
            throw new IllegalArgumentException("A placa deve ser informada");
        }

        if (veiculo.getModelo() == null || veiculo.getModelo().isBlank()) {
            throw new IllegalArgumentException("O modelo do veiculo deve ser informado");
        }
    }
}
