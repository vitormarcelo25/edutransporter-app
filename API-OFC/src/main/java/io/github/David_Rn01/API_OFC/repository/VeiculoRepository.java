package io.github.David_Rn01.API_OFC.repository;

import io.github.David_Rn01.API_OFC.model.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VeiculoRepository extends JpaRepository<Veiculo, Integer> {
    boolean existsByPlaca(String placa);

    Optional<Veiculo> findByPlacaIgnoreCase(String placa);
}
