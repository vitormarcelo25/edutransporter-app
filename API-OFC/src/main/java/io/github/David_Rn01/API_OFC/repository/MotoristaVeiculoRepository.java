package io.github.David_Rn01.API_OFC.repository;

import io.github.David_Rn01.API_OFC.model.MotoristaVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MotoristaVeiculoRepository extends JpaRepository<MotoristaVeiculo, Integer> {
    Optional<MotoristaVeiculo> findByid(Integer id);
}
